# Vitrine.ai — SaaS de SEO Local + GEO com IA

**Ajude negócios físicos a serem encontrados no Google Maps, Google Search e IAs generativas.**

**Status**: MVP em desenvolvimento  
**Stack**: Next.js 14 + Tailwind + Supabase + Mercado Pago + Google Business API

---

## 🚀 Quick Start

### 1. Clonar o repositório
```bash
git clone <seu-repo>
cd vitrine-ai
npm install
```

### 2. Configurar Supabase
Siga o guia completo: [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)

**Resumo:**
1. Crie projeto em [supabase.com](https://supabase.com)
2. Copie credenciais para `.env.local`
3. Execute as 3 migrações SQL em ordem

### 3. Configurar Mercado Pago
Siga o guia completo: [SETUP_MERCADO_PAGO.md](./SETUP_MERCADO_PAGO.md)

**Resumo:**
1. Crie conta de desenvolvedor em [Mercado Pago](https://www.mercadopago.com.br/developers)
2. Copie `Access Token` e `Public Key` para `.env.local`
3. Configure webhook

### 4. Variáveis de ambiente
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=seu-anon-key
SUPABASE_SERVICE_ROLE_KEY=seu-service-role-key

# Mercado Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_TOKEN=seu-token-secreto

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Rodar em desenvolvimentoém
```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000)

---

## 📂 Estrutura do Projeto

```
vitrine-ai/
├── app/
│   ├── (marketing)/       # Landing page, preços, blog
│   │   ├── page.tsx       # Home
│   │   ├── precos/        # Tabela de preços + checkout
│   │   └── analisar/      # Ferramenta gratuita (lead magnet)
│   ├── (app)/             # Dashboard autenticado
│   │   ├── dashboard/     # Home do usuário
│   │   ├── auditoria/     # Realizar auditoria
│   │   ├── reviews/       # Gerenciar reviews
│   │   ├── posts/         # Gerar Google Posts
│   │   ├── geo/           # Monitor GEO
│   │   └── configuracoes/ # Dados do usuário
│   ├── api/
│   │   ├── auth/          # Autenticação
│   │   ├── mercadopago/   # Pagamentos
│   │   │   ├── checkout/  # Criar preferência
│   │   │   └── webhook/   # Receber eventos
│   │   ├── google/        # Google Business API
│   │   └── ai/            # IA (Gemini, Claude)
│   └── (marketing)/layout.tsx
├── components/
│   ├── ui/                # shadcn/ui (button, card, etc)
│   ├── marketing/         # Navbar, Hero, ScoreCard
│   ├── dashboard/         # Componentes do app
│   └── shared/            # Componentes compartilhados
├── lib/
│   ├── supabase/          # Cliente + tipos
│   ├── mercadopago/       # SDK + helpers
│   ├── google/            # API helpers
│   └── utils/             # Utilitários
├── supabase/
│   └── migrations/        # SQL (001, 002, 003)
└── public/                # Assets estáticos
```

---

## 🔐 Autenticação

O projeto usa **Supabase Auth** com email. O fluxo é:

1. Usuário faz signup em `/login`
2. Confirma email (link enviado pelo Supabase)
3. Middleware redireciona para `/dashboard` após login
4. Rotas protegidas verificam `auth.uid()`

Policies do RLS garantem que usuários só acessem seus dados.

---

## 💳 Pagamento

**Integração com Mercado Pago:**

1. **Checkout** (`/api/mercadopago/checkout`)
   - Cria preferência com os detalhes do plano
   - Retorna `init_point` (link direto para MP)

2. **Webhook** (`/api/mercadopago/webhook`)
   - Recebe eventos de pagamento
   - Atualiza `profiles.plan` quando aprovado
   - Cria entry em `subscriptions`

3. **Status**
   - `payments`: histórico de todas as transações
   - `subscriptions`: assinatura ativa + próxima data de renovação

---

## 📊 Database Schema

### Tabelas principais:

**profiles**
- `id` (FK auth.users)
- `name`, `email`
- `plan` (free|essential|pro|agency)
- `mercadopago_customer_id`, `mercadopago_subscription_id`

**businesses**
- Negócios conectados via Google
- `google_account_id`, `google_location_id`
- `audit_score` (0-100)

**subscriptions**
- Assinatura ativa do usuário
- `status` (active|paused|cancelled)
- `current_period_start`, `next_billing_date`

**payments**
- Histórico de pagamentos
- `status` (pending|approved|failed|refunded)
- `mercadopago_payment_id`

**audits, reviews, google_posts, geo_checks, insights**
- Dados específicos de cada negócio

---

## 🎨 Design System

**Cores (conforme CLAUDE.md):**
- Primária: `#0F6E56`
- Destaque: `#1D9E75`
- Claro: `#5DCAA5`
- Muito claro: `#9FE1CB`
- Background: `#E1F5EE` / `#0A0F0D` (dark)
- Texto: `#04342C` (dark) / white
- Alertas: `#EF9F27` / `#E24B4A`

**Componentes:**
- Ui baseados em **shadcn/ui**
- Customizados com Tailwind
- Variantes: default, outline, ghost

---

## 📝 Commits

Formato sugerido:

```
feat: adicionar página de preços com checkout
fix: corrigir validação de webhook
docs: atualizar guia de setup
refactor: simplificar componente de checkout
```

Branches:
- `main`: produção
- `dev`: staging
- `feat/seu-nome`: features novas

---

## 🧪 Testes

Testar checkout localmente com ngrok:

```bash
# Terminal 1
npm run dev

# Terminal 2
ngrok http 3000
```

Use a URL do ngrok para configurar o webhook e testar.

---

## 🚢 Deploy

**Recomendado: Vercel**

1. Push para GitHub
2. Conecte repo no Vercel
3. Configure variáveis de ambiente
4. Deploy automático

```bash
# Ou deploy manual
vercel
```

---

## 🆘 Troubleshooting

**Erro ao fazer login**
- Verifique `.env.local` (Supabase URLs/keys)
- Confirme que Email provider está ativado em Supabase

**Erro ao fazer checkout**
- Verifique `MERCADOPAGO_ACCESS_TOKEN` no `.env.local`
- Teste endpoint `/api/mercadopago/checkout` com POST
- Veja logs no console

**Webhook não recebe notificações**
- Use ngrok para expor localhost
- Configure webhook URL corretamente no Mercado Pago
- Verifique que `SUPABASE_SERVICE_ROLE_KEY` está correto

**RLS bloqueando acesso**
- É normal! RLS está ativado
- Confirme que `auth.uid()` retorna o ID do usuário
- Verifique políticas em Supabase → Authentication → Policies

---

## 📚 Recursos úteis

- [Supabase Docs](https://supabase.com/docs)
- [Next.js 14](https://nextjs.org)
- [Mercado Pago API](https://www.mercadopago.com.br/developers/pt_BR)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)

---

## 📞 Suporte

Dúvidas? Consulte:
1. [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)
2. [SETUP_MERCADO_PAGO.md](./SETUP_MERCADO_PAGO.md)
3. [CLAUDE.md](./CLAUDE.md) — contexto do projeto

---

**Vitrine.ai** © 2024 — Feito com ❤️ para pequenos negócios
