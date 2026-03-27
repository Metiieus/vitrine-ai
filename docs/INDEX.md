# 📚 Vitrine.ai — Documentação

Bem-vindo à documentação do Vitrine.ai! Aqui você encontra tudo que precisa para entender, desenvolver e fazer deploy da aplicação.

## 📑 Índice de Documentação

### 🚀 Início Rápido
- [**SETUP.md**](./SETUP.md) — Configuração do ambiente local + variáveis de ambiente
- [**PROJECT.md**](./PROJECT.md) — Visão geral do projeto, business model, roadmap

### 🏗️ Arquitetura & Design
- [**ARCHITECTURE.md**](./ARCHITECTURE.md) — Stack técnico, estrutura de pastas, padrões
- [**DATABASE.md**](./DATABASE.md) — Schema Supabase, RLS policies, migrations
- [**API.md**](./API.md) — Endpoints, autenticação, webhooks

### 🔐 Segurança
- [**SECURITY.md**](./SECURITY.md) — RLS policies, rate limiting, validação, encryption
- [**RLS_GUIDE.md**](./RLS_GUIDE.md) — Guide completo de Row Level Security

### ⚡ Performance & Otimizações
- [**PERFORMANCE.md**](./PERFORMANCE.md) — Índices, caching, query optimization

### 🚢 Deployment
- [**DEPLOYMENT.md**](./DEPLOYMENT.md) — Deploy em Vercel, Supabase, variáveis de env em produção

### 🧪 Testing & QA
- [**TESTING.md**](./TESTING.md) — Estratégia de testes, integration tests, E2E

### 📊 Monitoring & Observability
- [**MONITORING.md**](./MONITORING.md) — Sentry, Datadog, error tracking, alertas

## 🎯 Seções Principais

### Tech Stack
- **Frontend:** Next.js 14 (React 18, App Router)
- **Styling:** Tailwind CSS + shadcn/ui
- **Backend:** Vercel Functions + Supabase (PostgreSQL)
- **Auth:** Supabase Auth + OAuth Google
- **IA:** Anthropic Claude API
- **Payments:** Mercado Pago
- **Cache:** Upstash Redis (rate limiting)

### Estrutura de Pastas
```
vitrine-ai/
├── app/                  # Next.js app directory
│   ├── (marketing)/      # Landing page, blog, login
│   ├── (app)/            # Dashboard e features autenticadas
│   ├── api/              # API routes
│   └── auth/             # Auth flows
├── components/           # React components
│   ├── dashboard/        # Componentes do dashboard
│   ├── marketing/        # Componentes da landing
│   ├── shared/           # Componentes reutilizáveis
│   └── ui/               # shadcn/ui components
├── lib/                  # Utilities e lógica de negócio
│   ├── supabase/         # Clients e queries
│   ├── google/           # Google APIs
│   ├── ai/               # Claude integrations
│   ├── services/         # Business logic (AuditService, etc)
│   └── security/         # Auth, RLS, validation
├── supabase/             # Database
│   └── migrations/       # SQL migrations
├── public/               # Assets estáticos
└── docs/                 # Esta documentação
```

## 📞 Suporte

- **Issues:** GitHub Issues
- **Security:** `security@vitrine.ai`
- **Questions:** Checa a documentação ou abre uma issue

---

**Last updated:** 27 de março de 2026  
**Version:** 1.0.0
