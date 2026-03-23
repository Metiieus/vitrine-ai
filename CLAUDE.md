# CLAUDE.md — Vitrine.ai

## O que é este projeto

Vitrine.ai é um SaaS brasileiro de SEO Local + GEO com IA para negócios físicos (restaurantes, clínicas, oficinas, salões). Ajuda donos de negócios a serem encontrados no Google Maps, Google Search e nas respostas de IAs generativas (ChatGPT, Gemini, Perplexity).

**Não existe concorrente brasileiro direto.** Ferramentas gringas (Semrush, BrightLocal, Localo) custam US$99-139/mês e são em inglês. O Vitrine.ai cobra R$49-299/mês em português.

---

## Status atual

### ✅ Concluído
- Estudo de mercado completo (mercado SaaS BR = US$7,9bi em 2025, projeção US$22bi em 2027)
- Análise de concorrência (0 concorrentes diretos no Brasil para SEO local + GEO)
- Plano de negócio detalhado (documento .docx gerado)
- Branding: nome (Vitrine.ai), paleta de cores, tom de voz, taglines, copy
- Prompts para geração de logo (Whisk, Midjourney, DALL-E, Leonardo, Stable Diffusion)
- Logo gerado pelo fundador
- Landing page completa (HTML responsivo com animações)

### 🔨 A construir (por prioridade)
1. Setup do projeto (Next.js + Supabase + Google Business Profile API)
2. Dashboard de auditoria (feature principal — score 0-100 do perfil)
3. Motor de IA para respostas a reviews
4. Gerador de Google Posts com IA
5. Monitor GEO (verificar presença em ChatGPT/Gemini/Perplexity)
6. Ferramenta gratuita de análise (lead magnet)
7. Sistema de checkout e cobrança recorrente
8. Scripts de prospecção (porta a porta digital)
9. Blog SEO (artigos para aquisição orgânica)

---

## Marca e identidade

### Nome
**Vitrine.ai**

### Taglines (usar conforme contexto)
- "Sua vitrine no Google e nas IAs"
- "Seja encontrado. Sempre."
- "O Maps te mostra. A IA te indica."
- "De invisível a indispensável."

### Headline principal
"Quando alguém busca o que você vende, você aparece?"

### Paleta de cores
```
Primária (ícone/logo):    #0F6E56
Destaque (CTAs, .ai):     #1D9E75
Claro (detalhes):         #5DCAA5
Muito claro:              #9FE1CB
Background claro:         #E1F5EE
Texto escuro:             #04342C
Acento quente (alertas):  #EF9F27
Erro/urgência:            #E24B4A
Background dark:          #0A0F0D
Surface dark:             #1a1f1c
```

### Fontes
- **Display/títulos:** Fraunces (serif, para headlines com personalidade)
- **Body/UI:** DM Sans (sans-serif, clean e legível)
- **Código/dados:** JetBrains Mono ou sistema monospace

### Tom de voz
- **Direto:** fala a língua do comerciante, zero jargão tech
- **Confiante:** mostra dados reais, números, não promessas vagas
- **Próximo:** trata por "você", usa exemplos do dia a dia (padaria, oficina, salão)

---

## Arquitetura técnica

### Stack
```
Frontend:     Next.js 14+ (App Router) + Tailwind CSS + shadcn/ui
Deploy:       Vercel
Backend:      Supabase (Auth, Postgres, Edge Functions, Storage)
Auth:         Supabase Auth com OAuth Google (para conectar Google Business Profile)
IA:           Claude API (Sonnet) para reviews/posts + OpenAI/Google APIs para monitor GEO
Google:       Google Business Profile API (reviews, posts, insights, locations)
SEO Data:     DataForSEO API (rankings locais, SERP, concorrentes)
Pagamento:    AbacatePay (Pix Automático + cartão) ou Stripe
Jobs/Cron:    Vercel Cron ou Supabase pg_cron
Email:        Resend ou Loops
```

### Estrutura de pastas sugerida
```
vitrine-ai/
├── app/
│   ├── (marketing)/          # Landing page, blog, preços
│   │   ├── page.tsx          # Home/landing
│   │   ├── precos/
│   │   ├── blog/
│   │   └── analisar/         # Ferramenta gratuita (lead magnet)
│   ├── (app)/                # Dashboard autenticado
│   │   ├── dashboard/
│   │   ├── auditoria/
│   │   ├── reviews/
│   │   ├── posts/
│   │   ├── geo/
│   │   ├── relatorios/
│   │   └── configuracoes/
│   ├── api/
│   │   ├── google/           # Endpoints para Google Business API
│   │   ├── ai/               # Endpoints para Claude/OpenAI
│   │   ├── geo/              # Monitor GEO
│   │   ├── webhook/          # Webhooks de pagamento
│   │   └── cron/             # Jobs agendados
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── marketing/            # Componentes da landing
│   ├── dashboard/            # Componentes do app
│   └── shared/
├── lib/
│   ├── supabase/             # Cliente e tipos
│   ├── google/               # Google Business API helpers
│   ├── ai/                   # Claude/OpenAI helpers
│   ├── geo/                  # Monitor GEO logic
│   └── utils/
├── supabase/
│   └── migrations/           # SQL migrations
└── public/
```

### Schema do banco (Supabase/Postgres)
```sql
-- Usuários (gerenciado pelo Supabase Auth)
-- profiles
create table profiles (
  id uuid references auth.users primary key,
  name text,
  email text,
  plan text default 'free', -- free, essential, pro, agency
  stripe_customer_id text,
  created_at timestamptz default now()
);

-- Negócios conectados
create table businesses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  google_account_id text,
  google_location_id text,
  name text not null,
  category text,
  address text,
  city text,
  state text,
  phone text,
  website text,
  google_rating numeric,
  total_reviews int,
  last_audit_at timestamptz,
  audit_score int, -- 0-100
  created_at timestamptz default now()
);

-- Auditorias
create table audits (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  score int not null, -- 0-100
  details jsonb, -- { photos: 75, description: 45, reviews: 15, posts: 0, geo: 40 }
  tasks jsonb, -- [{ priority: 'high', text: '...', category: '...' }]
  created_at timestamptz default now()
);

-- Reviews
create table reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  google_review_id text unique,
  author_name text,
  rating int,
  text text,
  ai_response text,
  response_status text default 'pending', -- pending, generated, published
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Google Posts gerados
create table google_posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  content text not null,
  image_url text,
  status text default 'draft', -- draft, scheduled, published
  published_at timestamptz,
  created_at timestamptz default now()
);

-- Monitor GEO
create table geo_checks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  query text not null, -- "melhor pizzaria em moema"
  ai_platform text not null, -- chatgpt, gemini, perplexity, ai_overviews
  found boolean default false,
  position int, -- posição se encontrado
  snippet text, -- trecho da resposta da IA
  checked_at timestamptz default now()
);

-- Métricas do Google Business (insights)
create table insights (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id),
  period_start date,
  period_end date,
  searches int,
  views int,
  calls int,
  direction_requests int,
  website_clicks int,
  created_at timestamptz default now()
);
```

### Google Business Profile API — Fluxo de integração
```
1. Usuário clica "Conectar Google Meu Negócio"
2. OAuth 2.0 com scopes: business.manage
3. Listar locations do usuário → POST /api/google/locations
4. Usuário seleciona qual negócio conectar
5. Salvar google_account_id + google_location_id no banco
6. Puxar dados iniciais: info, reviews, insights, posts
7. Rodar primeira auditoria automática
8. Agendar cron jobs para sync semanal
```

### Lógica da auditoria (score 0-100)
```
Score = soma ponderada de 5 categorias:

1. FOTOS E MÍDIA (25 pontos)
   - Tem logo? (+5)
   - Tem foto de capa? (+5)
   - ≥5 fotos do ambiente? (+5)
   - ≥3 fotos de produtos/serviços? (+5)
   - Fotos atualizadas nos últimos 90 dias? (+5)

2. INFORMAÇÕES E CATEGORIAS (25 pontos)
   - Descrição preenchida com ≥150 caracteres? (+5)
   - Categoria principal correta? (+5)
   - ≥2 categorias secundárias? (+3)
   - Horários preenchidos (todos os dias)? (+4)
   - Horários especiais/feriados? (+3)
   - Atributos preenchidos (Wi-Fi, estacionamento, etc)? (+3)
   - Website e telefone? (+2)

3. REVIEWS (20 pontos)
   - ≥50 reviews? (+5)
   - Rating ≥4.0? (+5)
   - ≥80% das reviews respondidas? (+5)
   - Tempo médio de resposta <48h? (+5)

4. GOOGLE POSTS (15 pontos)
   - Tem posts? (+3)
   - ≥1 post nos últimos 7 dias? (+4)
   - ≥4 posts no último mês? (+4)
   - Posts com imagem? (+2)
   - Posts com CTA? (+2)

5. VISIBILIDADE EM IAs — GEO (15 pontos)
   - Aparece no ChatGPT? (+5)
   - Aparece no Gemini? (+5)
   - Aparece no Perplexity? (+5)
```

### Monitor GEO — Como funciona
```
Para cada negócio, gerar queries tipo:
- "melhor {categoria} em {cidade}"
- "recomendação de {categoria} em {bairro}"
- "{categoria} perto de {endereço}"

Enviar essas queries para:
1. OpenAI API (ChatGPT) → verificar se o negócio é mencionado na resposta
2. Google Gemini API → mesma verificação
3. Anthropic API (Claude) → mesma verificação
4. Perplexity API → mesma verificação (ou scraping se não tiver API)

Salvar resultado em geo_checks com: found, position, snippet
Gerar recomendações baseadas nos resultados
```

---

## Modelo de preços

| Plano | Preço | Features principais |
|-------|-------|-------------------|
| **Essencial** | R$49/mês | Auditoria, score, checklist, 5 respostas IA/mês, 2 posts/mês |
| **Profissional** | R$99/mês | Tudo do Essencial + respostas ilimitadas, 4 posts/mês, monitor GEO (3 IAs), ranking Maps, relatório PDF |
| **Agência** | R$299/mês | Tudo do Pro + até 5 perfis, white-label, monitor GEO (5 IAs), API, suporte prioritário |

### Unit economics alvo
- CAC: < R$150
- LTV: R$900+ (ticket médio R$99 × 9 meses)
- Payback: < 2 meses
- Margem bruta: ~85%
- Meta 90 dias: 100 clientes = R$10k MRR

---

## Estratégia de aquisição

### Canal 1 — Porta a porta digital (Semana 1)
Rodar auditoria em 50 negócios da região, enviar resultado por WhatsApp/email com oferta de trial 14 dias grátis.

### Canal 2 — Ferramenta gratuita como lead magnet (Semana 2)
Página pública "/analisar" — usuário digita nome do negócio, vê score + 3 dicas. Para ver relatório completo, precisa criar conta.

### Canal 3 — Comunidades locais (Semana 1-4)
Grupos de WhatsApp de comerciantes, CDLs, Sebrae, associações comerciais.

### Canal 4 — SEO + Build in Public (Contínuo)
Blog com artigos tipo "Como aparecer no Google Maps em [cidade]". LinkedIn/Twitter mostrando MRR.

### Canal 5 — Parcerias com agências (Mês 2-3)
Agências de marketing local revendem com comissão de 20-30%.

---

## Roadmap de desenvolvimento

### Semana 1-2: Fundação
- [ ] Setup Next.js 14 + Tailwind + shadcn/ui
- [ ] Configurar Supabase (auth, banco, migrations)
- [ ] Integrar Google Business Profile API (OAuth + listar locations)
- [ ] Dashboard de auditoria (score + barras + checklist)
- [ ] Landing page (já existe o HTML — converter para Next.js)
- [ ] Começar prospecção porta a porta com 50 negócios

### Semana 3: IA
- [ ] Motor de respostas IA para reviews (Claude API)
- [ ] Gerador de Google Posts com IA
- [ ] Sugestão de keywords locais por categoria/região

### Semana 4: GEO + Lançamento
- [ ] Monitor GEO (consultar ChatGPT/Gemini/Perplexity APIs)
- [ ] Relatório GEO visual
- [ ] Checkout com AbacatePay ou Stripe
- [ ] Onboarding flow
- [ ] Lançar para 10 clientes beta (trial 14 dias)

### Mês 2: Tração
- [ ] Converter betas em pagantes
- [ ] Ferramenta gratuita de análise (lead magnet)
- [ ] 5 artigos SEO para o blog
- [ ] Primeiras parcerias com agências
- [ ] Meta: 30-50 clientes

### Mês 3: Escala
- [ ] Plano Agência com white-label
- [ ] Heat map de ranking no Maps
- [ ] Relatório PDF automático
- [ ] Alertas via WhatsApp (Evolution API ou Z-API)
- [ ] Meta: 100 clientes = R$10k MRR

---

## Variáveis de ambiente necessárias

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Google Business Profile API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# IA
ANTHROPIC_API_KEY=          # Claude para respostas/posts
OPENAI_API_KEY=             # ChatGPT para monitor GEO
GOOGLE_AI_API_KEY=          # Gemini para monitor GEO

# SEO Data
DATAFORSEO_LOGIN=
DATAFORSEO_PASSWORD=

# Pagamento
ABACATEPAY_API_KEY=         # ou STRIPE_SECRET_KEY

# Email
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=https://vitrine.ai
```

---

## Convenções de código

- **TypeScript** em tudo, strict mode
- **Server Components** por padrão, "use client" só quando necessário
- **Server Actions** para mutations (formulários, operações de escrita)
- **Supabase RLS** (Row Level Security) habilitado em todas as tabelas
- **Zod** para validação de inputs
- **Tailwind** para estilos, sem CSS modules
- **Componentes shadcn/ui** como base, customizados com as cores da marca
- Commits em português, formato: `feat: adicionar auditoria de fotos`
- Branches: `main` (produção), `dev` (desenvolvimento), `feat/nome-da-feature`

---

## Contexto de mercado (para copy e decisões)

- Mercado SaaS BR: US$7,9bi (2025), projeção US$22bi (2027)
- 93% da população adulta brasileira usa Pix
- 22.869 startups ativas no Brasil, 51,8% usando IA
- Apenas 5% das empresas brasileiras usam SaaS
- Google Business Profile API é gratuita
- WhatsApp Business lançou IA própria em fev/2026 (concorrente para chatbots, NÃO para SEO local)
- Governo lançou app "Meu MEI Digital" em dez/2025 (concorrente para gestão fiscal, NÃO para SEO local)
- Zero ferramentas brasileiras de GEO (aparecer em IAs generativas)
- Concorrentes gringos: Semrush ($139/mês), BrightLocal ($39-79/mês), Localo (~$29/mês) — todos em inglês

---

## Arquivos já criados

- `vitrine-ai-landing-page.html` — Landing page completa (converter para Next.js)
- `ranklocal-plano.docx` — Plano de negócio completo
- `vitrine-ai-prompts-logo.md` — Prompts para geração de logo
