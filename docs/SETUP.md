# 🚀 Setup — Vitrine.ai

## Pré-requisitos

- Node.js 18+
- pnpm 8+ (ou npm)
- Git
- PostgreSQL 15+ (ou Supabase account)

## 1️⃣ Clone e Instale

```bash
# Clone o repo
git clone https://github.com/seu-org/vitrine-ai.git
cd vitrine-ai

# Instale dependências
pnpm install

# Configure Python venv (para scripts)
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou
.venv\Scripts\Activate.ps1  # Windows
```

## 2️⃣ Variáveis de Ambiente

Copie `.env.local.example` para `.env.local`:

```bash
cp .env.local.example .env.local
```

Preencha as variáveis:

### Supabase
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx
```

Obter em: https://app.supabase.com → Project Settings → API Keys

### Google OAuth (Google Business Profile API)
```env
GOOGLE_CLIENT_ID=xxxxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
```

Obter em: https://console.cloud.google.com → OAuth 2.0 Client IDs

### Claude AI (Anthropic)
```env
ANTHROPIC_API_KEY=sk-xxxxx
```

Obter em: https://console.anthropic.com → API Keys

### Mercado Pago
```env
MERCADOPAGO_ACCESS_TOKEN=xxxxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=xxxxx
MERCADOPAGO_WEBHOOK_TOKEN=xxxxx
```

Obter em: https://www.mercadopago.com.br/developers

### Upstash Redis (Rate Limiting)
```env
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx
```

Obter em: https://console.upstash.com

### App
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 3️⃣ Banco de Dados

### Opção A: Supabase Cloud (Recomendado)

1. Crie uma conta em https://supabase.com
2. Crie um projeto novo
3. Na aba SQL Editor, execute a migration:

```bash
# Ver migrations
ls supabase/migrations/

# Copiar conteúdo de supabase/migrations/001_initial_schema.sql
# Colar no SQL Editor do Supabase
```

### Opção B: PostgreSQL Local

```bash
# Crie database
createdb vitrine_ai

# Execute migrations
psql vitrine_ai < supabase/migrations/001_initial_schema.sql
```

## 4️⃣ Inicie o Dev Server

```bash
pnpm dev
```

Abra http://localhost:3000

### Hot Module Replacement
- Alterações em `app/`, `components/`, `lib/` recarregam automaticamente
- Alterações em `.env.local` requerem restart do servidor

## 5️⃣ Testes

```bash
# Executar testes
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 6️⃣ Linting & Formatting

```bash
# Lint (ESLint)
pnpm lint

# Fix linting errors
pnpm lint:fix

# Format (Prettier)
pnpm format
```

## 🆘 Troubleshooting

### Error: `NEXT_PUBLIC_SUPABASE_URL is required`
- Verifique que `.env.local` existe e tem as variáveis
- Restart do servidor

### Error: `Cannot find module '@/lib/...'`
- Verifique tsconfig.json paths
- Arquivo existe em `lib/`?
- `pnpm install` foi executado?

### Error: PostgreSQL connection refused
- Verifique que PostgreSQL está rodando
- Verifique credenciais em `.env.local`
- Para Supabase, verifique URL e keys

### Error: Google OAuth mismatch
- Verifique que `GOOGLE_REDIRECT_URI` matches exatamente o configurado no Google Console
- Formato: `http://localhost:3000/api/auth/callback/google`

---

**Próximo passo:** Leia [ARCHITECTURE.md](./ARCHITECTURE.md) para entender a estrutura do código.
