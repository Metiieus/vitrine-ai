# 🗄️ Database — Vitrine.ai

## Schema Overview

Supabase PostgreSQL com 10 tabelas principais + RLS em todas.

```sql
-- Tabelas Principais:
profiles         -- Perfis de usuário (auto-gerado no signup)
businesses       -- Negócios / Locations
audits           -- Histórico de audits + score
reviews          -- Google Reviews + respostas IA
google_posts     -- Posts do Google Business
geo_checks       -- Resultados do monitor GEO
insights         -- Métricas do Google Business
google_connections -- OAuth tokens
payments         -- Histórico de pagamentos
subscriptions    -- Status do plano ativo
geo_rankings     -- Rankings por localização
audit_logs       -- Auditoria de segurança
```

## Tabelas Detalhadas

### 1. profiles
Perfil do usuário — criado automaticamente quando signup.

```sql
CREATE TABLE profiles (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email              text UNIQUE NOT NULL,
  full_name          text,
  avatar_url         text,
  mercadopago_customer_id  text,  -- Para assinaturas recorrentes
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê e edita o próprio perfil"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Trigger: cria profile automaticamente ao signup
CREATE TRIGGER create_profile_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_on_signup();
```

---

### 2. google_connections
Armazena OAuth tokens Google (um por usuário).

```sql
CREATE TABLE google_connections (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  google_account_id   text,              -- accounts/xxx
  google_email        text,              -- user@gmail.com
  access_token_enc    text NOT NULL,     -- AES-256-GCM encrypted
  refresh_token_enc   text,              -- AES-256-GCM encrypted
  token_expires_at    timestamptz,
  scopes              text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)                        -- Um usuário = um Google
);

ALTER TABLE google_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê e edita sua conexão Google"
  ON google_connections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Encryption:** Tokens são encriptados com AES-256-GCM antes de salvar.

---

### 3. businesses
Negócios / Localizações gerenciadas pelo usuário.

```sql
CREATE TABLE businesses (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  google_connection_id uuid REFERENCES google_connections(id) ON DELETE SET NULL,
  google_location_id  text,              -- locations/xxx
  name                text NOT NULL,
  category            text,
  address             text,
  phone               text,
  website             text,
  latitude            numeric(10, 8),
  longitude           numeric(11, 8),
  google_rating       numeric(2, 1),     -- 0-5
  review_count        integer DEFAULT 0,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, google_location_id)
);

ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia seus negócios"
  ON businesses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_businesses_user_id ON businesses(user_id);
```

---

### 4. audits
Histórico de auditorias — um por negócio por auditoria.

```sql
CREATE TABLE audits (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  score               integer CHECK (score BETWEEN 0 AND 100),
  fotos_score         integer, -- 0-25
  info_score          integer, -- 0-25
  reviews_score       integer, -- 0-20
  posts_score         integer, -- 0-15
  geo_score           integer, -- 0-15
  checklist           jsonb,   -- {fotos: [...], info: [...], ...}
  issues              jsonb,   -- [{type: "warning", message: "..."}]
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê auditorias dos seus negócios"
  ON audits FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = audits.business_id AND b.user_id = auth.uid()
    )
  );

CREATE INDEX idx_audits_business_id ON audits(business_id);
```

**Checklist structure:**
```json
{
  "fotos": [
    {"name": "Logo", "completed": true},
    {"name": "5+ fotos do ambiente", "completed": false}
  ],
  "info": [...],
  "reviews": [...],
  "posts": [...],
  "geo": [...]
}
```

---

### 5. reviews
Google Reviews + respostas IA.

```sql
CREATE TABLE reviews (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  google_review_id    text UNIQUE,       -- Identificador do Google
  author_name         text NOT NULL,
  author_email        text,
  rating              integer CHECK (rating BETWEEN 1 AND 5),
  text                text,
  ai_response         text,              -- Resposta gerada por Claude
  response_status     text DEFAULT 'draft'  -- draft, published, archived
    CHECK (response_status IN ('draft', 'published', 'archived')),
  created_at          timestamptz NOT NULL DEFAULT now(),
  responded_at        timestamptz,
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia reviews dos seus negócios"
  ON reviews FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = reviews.business_id AND b.user_id = auth.uid()
    )
  );

CREATE INDEX idx_reviews_business_id ON reviews(business_id);
CREATE INDEX idx_reviews_status ON reviews(response_status);
```

---

### 6. google_posts
Posts do Google Business — criados ou sincronizados.

```sql
CREATE TABLE google_posts (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  google_post_id      text,              -- ID do Google (se sincronizado)
  title               text,
  content             text NOT NULL,
  media_url           text,              -- URL da imagem/vídeo
  cta_type            text,              -- Shop, Learn More, Call, etc
  status              text DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_at        timestamptz,
  published_at        timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE google_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário gerencia posts dos seus negócios"
  ON google_posts FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = google_posts.business_id AND b.user_id = auth.uid()
    )
  );

CREATE INDEX idx_google_posts_business_id ON google_posts(business_id);
CREATE INDEX idx_google_posts_status ON google_posts(status);
```

---

### 7. geo_checks
Resultados do monitor GEO — verificação de presença em IAs.

```sql
CREATE TABLE geo_checks (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  ai_platform         text NOT NULL,     -- gemini, openai, perplexity
  query               text NOT NULL,     -- Search query usado
  found               boolean NOT NULL,  -- Apareceu na resposta?
  position            integer,           -- Posição (1, 2, 3, ...)
  snippet             text,              -- Snippet da resposta
  checked_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE geo_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê GEO checks dos seus negócios"
  ON geo_checks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = geo_checks.business_id AND b.user_id = auth.uid()
    )
  );

CREATE INDEX idx_geo_checks_business_id ON geo_checks(business_id);
CREATE INDEX idx_geo_checks_platform ON geo_checks(ai_platform);
```

---

### 8. insights
Métricas do Google Business Profile API.

```sql
CREATE TABLE insights (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id         uuid NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  metric_date         date NOT NULL,     -- Data do insight
  searches            integer DEFAULT 0, -- "Pessoas pesquisaram"
  views               integer DEFAULT 0, -- "Visualizações do perfil"
  calls               integer DEFAULT 0, -- "Chamadas"
  directions          integer DEFAULT 0, -- "Pedir direções"
  website_clicks      integer DEFAULT 0, -- "Cliques no site"
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(business_id, metric_date)
);

ALTER TABLE insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê insights dos seus negócios"
  ON insights FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM businesses b
      WHERE b.id = insights.business_id AND b.user_id = auth.uid()
    )
  );

CREATE INDEX idx_insights_business_id ON insights(business_id);
CREATE INDEX idx_insights_date ON insights(metric_date);
```

---

### 9. payments
Histórico de pagamentos — integração Mercado Pago.

```sql
CREATE TABLE payments (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mercadopago_payment_id text UNIQUE,
  mercadopago_preference_id text,
  status              text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'failed', 'refunded')),
  amount              numeric(10, 2) NOT NULL,
  plan                text NOT NULL CHECK (plan IN ('essential', 'pro', 'agency')),
  billing_cycle       text,              -- monthly, annual
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê seus pagamentos"
  ON payments FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_mp_id ON payments(mercadopago_payment_id);
```

---

### 10. subscriptions
Status da assinatura/plano ativo.

```sql
CREATE TABLE subscriptions (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  mercadopago_subscription_id text UNIQUE,
  mercadopago_plan_id text,
  plan                text NOT NULL
    CHECK (plan IN ('free', 'essential', 'pro', 'agency')),
  status              text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'cancelled')),
  current_period_start timestamptz,
  current_period_end  timestamptz,
  next_billing_date   timestamptz,
  cancellation_reason text,
  paused_at           timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê sua assinatura"
  ON subscriptions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_mp_id ON subscriptions(mercadopago_subscription_id);
```

---

## Migrations

Todas as tabelas are criadas via SQL migrations em `/supabase/migrations/`.

### Rodar Migrations

**Supabase Cloud:**
```bash
# Copy-paste SQL do arquivo migration
# No Supabase Dashboard → SQL Editor
# paste e execute
```

**Local (PostgreSQL):**
```bash
psql vitrine_ai < supabase/migrations/001_initial_schema.sql
```

### Versioning
- `001_initial_schema.sql` — Tabelas principais + RLS
- `002_google_connections.sql` — OAuth tokens
- `003_mercado_pago_integration.sql` — Payments + subscriptions
- `004_geo_rankings.sql` — Monitor GEO

---

## Row Level Security (RLS)

Todas as tabelas têm RLS habilitado. Isso significa:

```sql
-- User A consegue fazer:
SELECT * FROM businesses WHERE user_id = auth.uid();
-- Output: Apenas businesses de User A

-- User A tenta:
SELECT * FROM businesses WHERE user_id = '<user-b-uuid>';
-- Output: [] (vazio due to RLS policy)
```

### Como RLS Funciona
1. Supabase autentica usuário → gera JWT com `sub = user_id`
2. Qualquer query é automaticamente filtrada
3. Não precisa de `WHERE user_id = ...` (é automático)
4. Muito mais seguro que filtros manuais

### Validar RLS em Supabase Console
```sql
-- Supabase → SQL Editor → Execute:

SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Output esperado: todos com rowsecurity = true
```

---

## Performance

### Índices Presentes
- `idx_businesses_user_id` — Busca por usuário
- `idx_reviews_business_id` — Busca reviews por negócio
- `idx_google_posts_business_id` — Busca posts por negócio
- `idx_insights_business_id` — Busca insights
- `idx_payments_user_id`, `idx_payments_status` — Histórico pagamentos
- `idx_subscriptions_user_id` — Status plano

### Agregação de Dados
Em `/dashboard`, ao invés de 4 queries:
```ts
// ❌ Antes (4 queries):
const audits = await supabase.from('audits').select('*').eq('business_id', id);
const reviews = await supabase.from('reviews').select('*').eq('business_id', id);
const insights = await supabase.from('insights').select('*').eq('business_id', id);
const geo = await supabase.from('geo_checks').select('*').eq('business_id', id);

// ✅ Depois (1 query):
const { data } = await supabase
  .from('businesses')
  .select('*, audits(*), reviews(*), insights(*), geo_checks(*)')
  .eq('id', id)
  .single();
```

---

**Próximo:** Leia [SECURITY.md](./SECURITY.md) para RLS, encryption, validation.
