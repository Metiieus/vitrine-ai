# 🏗️ Arquitetura — Vitrine.ai

## Tech Stack

```
Frontend:     Next.js 14 (React 18 SSR) + TypeScript 5
Styling:      Tailwind CSS + shadcn/ui
Deploy:       Vercel (Edge + Functions)
Backend:      Supabase (PostgreSQL 15) + RLS
Auth:         Supabase Auth + OAuth 2.0 (Google)
IA:           Anthropic Claude (Sonnet 4.6)
Payments:     Mercado Pago (Assinaturas + Webhooks)
Cache/Rate:   Upstash Redis (Sliding Window)
Security:     AES-256-GCM encryption, HMAC-SHA256, Zod validation
```

## Estrutura de Pastas

```
vitrine-ai/
├── app/                              # Next.js App Router
│   ├── (marketing)/                  # Rotas públicas (landing, preços, etc)
│   │   ├── page.tsx                  # Home /
│   │   ├── precos/page.tsx          # /precos
│   │   ├── blog/                     # /blog/[slug]
│   │   ├── login/page.tsx           # /login (redirect to Supabase)
│   │   ├── analisar/page.tsx        # /analisar (ferramenta gratuita)
│   │   ├── privacidade/page.tsx     # /privacidade
│   │   ├── termos/page.tsx          # /termos
│   │   └── layout.tsx                # Layout com navbar
│   │
│   ├── (app)/                        # Rotas autenticadas (middleware protege)
│   │   ├── dashboard/page.tsx        # / (SEO dashboard)
│   │   ├── auditoria/page.tsx       # /auditoria/[businessId]
│   │   ├── reviews/page.tsx         # /reviews (gerenciar respostas IA)
│   │   ├── posts/page.tsx           # /posts (gerar Google Posts)
│   │   ├── geo/page.tsx             # /geo (monitor GEO)
│   │   ├── relatorios/page.tsx      # /relatorios (PDF exports)
│   │   ├── configuracoes/page.tsx   # /configuracoes (account)
│   │   └── layout.tsx                # Layout com sidebar
│   │
│   ├── api/                          # API Routes
│   │   ├── auth/                     # Autenticação
│   │   │   ├── confirm/route.ts      # Email confirmation callback
│   │   │   └── logout/route.ts       # Logout
│   │   │
│   │   ├── google/                   # Google Business APIs
│   │   │   ├── locations/route.ts    # Listed negócios do usuário
│   │   │   ├── reviews/route.ts      # Listar reviews
│   │   │   ├── insights/route.ts     # Métricas
│   │   │   └── posts/route.ts        # Gerenciar posts
│   │   │
│   │   ├── ai/                       # Claude API
│   │   │   ├── review-response/      # Gerar resposta para review
│   │   │   └── google-post/          # Gerar Google Post
│   │   │
│   │   ├── audit/                    # Lógica de auditoria
│   │   │   ├── run/route.ts          # Rodar auditoria completa
│   │   │   └── score/route.ts        # Calcular score
│   │   │
│   │   ├── geo/                      # Monitor GEO
│   │   │   ├── check/route.ts        # Verificar presença em IAs
│   │   │   └── results/route.ts      # Histórico de checks
│   │   │
│   │   ├── mercadopago/              # Pagamentos
│   │   │   ├── checkout/route.ts     # Criar preference
│   │   │   └── success/route.ts      # Confirmação
│   │   │
│   │   ├── webhook/                  # Webhooks
│   │   │   └── mercadopago/route.ts  # Mercado Pago notifications
│   │   │
│   │   └── cron/                     # Cron jobs (Vercel)
│   │       ├── sync-reviews/         # Sync reviews diariamente
│   │       └── refresh-tokens/       # Refresh Google tokens
│   │
│   ├── auth/                         # Auth callbacks
│   │   └── confirm/page.tsx          # Email confirmation page
│   │
│   ├── fonts/                        # Fontes customizadas (Fraunces, DM Sans)
│   ├── globals.css                   # Tailwind + custom CSS
│   ├── layout.tsx                    # Root layout
│   └── loading.tsx                   # Suspense fallback
│
├── components/                       # React Components
│   ├── dashboard/                    # Componentes do app
│   │   ├── Sidebar.tsx              # Navegação lateral
│   │   ├── ScoreGauge.tsx           # Score visual (0-100)
│   │   ├── AuditBars.tsx            # Barras de auditoria
│   │   ├── CheckoutButton.tsx       # Botão de upgrade
│   │   ├── ConnectBusiness.tsx      # Conectar Google
│   │   ├── DashboardClient.tsx      # Dashboard content
│   │   └── EmptyDashboard.tsx       # Sem negócios
│   │
│   ├── marketing/                    # Componentes da landing
│   │   ├── Navbar.tsx               # Header com menu
│   │   ├── ScoreCardMockup.tsx       # Score visual mockup
│   │   ├── FeaturesSection.tsx       # Features
│   │   ├── PricingSection.tsx        # Tabela de preços
│   │   ├── CtaInput.tsx             # Email capture
│   │   ├── CtaFinalSection.tsx       # CTA final
│   │   ├── GeoSection.tsx            # Seção de GEO
│   │   └── RevealItem.tsx            # Animação de reveal
│   │
│   ├── shared/                       # Componentes compartilhados
│   │   └── (empty por enquanto)
│   │
│   └── ui/                           # shadcn/ui
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── badge.tsx
│       ├── progress.tsx
│       ├── textarea.tsx
│       └── sonner.tsx               # Toast notifications
│
├── lib/                              # Utilities & Business Logic
│   ├── supabase/                    # Database
│   │   ├── client.ts                # Supabase client (client-side)
│   │   ├── server.ts                # Supabase client (server-side)
│   │   ├── types.ts                 # TypeScript types (from schema)
│   │   └── queries.ts               # Common queries (getUser, getBusiness, etc)
│   │
│   ├── google/                      # Google APIs
│   │   ├── client.ts                # Authenticated fetch + token refresh
│   │   ├── business.ts              # Listar locations, info
│   │   ├── reviews.ts               # Listar reviews, responder
│   │   ├── insights.ts              # Buscar métricas
│   │   ├── posts.ts                 # Criar/editar Google Posts
│   │   ├── oauth.ts                 # OAuth 2.0 flow
│   │   ├── token-refresh.ts         # Auto-refresh logic
│   │   └── audit.ts                 # Validação de dados Google
│   │
│   ├── ai/                          # Claude API
│   │   ├── claude.ts                # Client + helpers
│   │   ├── review-responses.ts      # Prompt de respostas
│   │   └── google-posts.ts          # Prompt de posts
│   │
│   ├── geo/                         # Monitor GEO
│   │   ├── radar-local.ts          # Lógica de verificação
│   │   └── queries.ts               # Geo check queries
│   │
│   ├── services/                    # Business Logic (Alto Nível)
│   │   ├── audit-service.ts         # Calcular score, checklist
│   │   ├── business-service.ts      # CRUD negócios
│   │   └── subscription-service.ts  # Gerenciar planos
│   │
│   ├── security/                    # Segurança
│   │   ├── validation.ts            # Zod schemas
│   │   ├── sanitization.ts          # XSS protection
│   │   ├── rate-limiter.ts          # Upstash Redis
│   │   ├── webhook-validation.ts    # HMAC-SHA256
│   │   ├── error-handler.ts         # Safe errors
│   │   ├── rls-validation.ts        # RLS checks
│   │   ├── audit.ts                 # Audit logging
│   │   └── index.ts                 # Exports
│   │
│   ├── mercadopago/                 # Pagamentos
│   │   └── client.ts                # MP API client
│   │
│   ├── performance/                 # Otimizações
│   │   └── optimizations.ts         # QueryCache, prefetch, etc
│   │
│   ├── hooks/                       # Custom React Hooks
│   │   └── useNavigate.tsx          # Navigation helper
│   │
│   ├── utils/                       # Utilities Gerais
│   │   ├── cn.ts                    # Tailwind class merge
│   │   ├── encrypt.ts               # AES-256-GCM encryption
│   │   └── (more as needed)
│   │
│   └── utils.ts                     # Misc utilities
│
├── supabase/                        # Database Schema
│   ├── migrations/                  # SQL migrations (versionadas)
│   │   ├── 001_initial_schema.sql  # 7 tabelas principais + RLS
│   │   ├── 002_google_connections.sql
│   │   ├── 003_mercado_pago_integration.sql
│   │   ├── 004_geo_rankings.sql
│   │   └── ...
│   │
│   ├── validate_rls.sql            # Script de validação RLS
│   └── seed-geo-rankings.sql       # Seed de teste
│
├── scripts/                         # Scripts Auxiliares
│   ├── setup-mp-plans.ts           # Criar planos no Mercado Pago
│   └── seed-test-data.ts           # Dados de teste
│
├── public/                          # Assets Estáticos
│   ├── robots.txt
│   ├── sitemap.xml
│   └── (images, fonts)
│
├── docs/                            # Documentação (NOVA)
│   ├── INDEX.md                     # Esta página
│   ├── SETUP.md                     # Setup local
│   ├── ARCHITECTURE.md              # Este arquivo
│   ├── DATABASE.md                  # Schema & Migrations
│   ├── SECURITY.md                  # RLS, validation, encryption
│   ├── API.md                       # Endpoints
│   └── DEPLOYMENT.md                # Deploy
│
├── .env.local.example               # Template de env
├── .env.local                       # GITIGNORE (variáveis reais)
├── .env.production.local            # Production env
├── .eslintrc.json                   # ESLint config
├── .gitignore
├── .git/
├── .next/                           # Build cache (GITIGNORE)
├── .venv/                           # Python venv (GITIGNORE)
├── .vercel/                         # Vercel config
├── .agent/                          # Agent customizations (opcional)
├──
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json                    # TypeScript config (com paths)
├── tsconfig.tsbuildinfo            # BUILD STATE (GITIGNORE)
├── tailwind.config.ts               # Tailwind config (cores custom)
├── postcss.config.mjs               # PostCSS (para Tailwind)
├── next.config.mjs                  # Next.js config
├── components.json                  # shadcn/ui config
├── vercel.json                      # Vercel deployment config
├── README.md                        # README principal (TO UPDATE)
├── middleware.ts                    # Auth middleware
├── next-env.d.ts                    # TypeScript auto-generated
├── lint_output.txt                  # REMOVE (build artifact)
├── node_modules/                    # GITIGNORE
└── (build artifacts)                # GITIGNORE (.next, dist, etc)
```

## Padrões Arquiteturais

### Server Components (Padrão)
- Componentes em `app/` são Server Components por padrão
- Usam `async/await` para queries, sem estado
- Otimizados para performance (menos JavaScript no cliente)

### Client Components ("use client")
- Apenas com interatividade necessária
- Hooks (useState, useEffect, useContext)
- Componentes UI interativos

### Server Actions
- Mutations (POST, PUT, DELETE)
- Form submissions
- Validação server-side (Zod)
- Invocadas diretamente via `ação()` em forms

### API Routes
- Apenas quando necessário (webhooks, Google APIs)
- Autenticação via Supabase JWT (middleware)
- Rate limiting via Upstash Redis

### RLS (Row Level Security)
- Toda query é filtrada automaticamente por `auth.uid()`
- Não precisa de filtros manuais em SELECT
- INSERT/UPDATE/DELETE validam com `WITH CHECK`

### Caching
- QueryCache LRU em `lib/performance/optimizations.ts`
- Client-side: React Query (opcional)
- Server-side: Supabase cacheamento automático

## Fluxos Principais

### 🔐 Autenticação (OAuth Google)
```
1. Usuário clica "Conectar Google"
2. Redirect para /api/auth/google (Supabase OAuth)
3. Google retorna para /auth/confirm
4. Trigger: cria profile automaticamente
5. Redirect para /dashboard
```

### 📊 Dashboard Carregamento
```
1. Middleware valida JWT
2. getUser() busca profile
3. getUserBusinesses() lista negócios
4. getBusinessAudits/Reviews/Insights/GeoChecks (aggregated)
5. Renderiza DashboardClient com dados
```

### 🤖 Geração de Resposta IA para Review
```
1. Usuário seleciona review em /reviews
2. Form POST /api/ai/review-response
3. Sanitização de inputs (XSS protection)
4. Claude API gera resposta
5. Salva em table reviews
6. Toast notificação
```

### 💳 Checkout & Pagamento
```
1. Usuário seleciona plano em /precos
2. POST /api/mercadopago/checkout
3. Cria preference (MP API)
4. Redirect para MP checkout page
5. Usuário completa pagamento
6. Webhook /api/webhook/mercadopago
7. Atualiza subscription no Supabase
```

### 🔄 Token Refresh Automático (Google OAuth)
```
1. Middleware: checa se token expirado
2. Se expirado: getValidAccessToken()
3. OAuth: refresh token → novo access token
4. Conditional update (evita race condition)
5. Retorna novo token
```

---

**Próximo:** Leia [DATABASE.md](./DATABASE.md) para schema e RLS.
