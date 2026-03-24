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
- Logo gerado pelo fundador
- Landing page convertida para Next.js (componentes: Navbar, ScoreCard, RevealItem, CtaInput)
- Setup do projeto: Next.js 14 + Tailwind + shadcn/ui + Supabase (auth, types, middleware)
- Migration SQL com 7 tabelas + RLS

### 🔨 A construir (por prioridade)
1. Configurar Supabase (criar projeto + rodar migration + preencher .env.local)
2. Dashboard de auditoria (feature principal — score 0-100 do perfil)
3. Integrar Google Business Profile API (OAuth + listar locations)
4. Motor de IA para respostas a reviews (Gemini API — gratuito)
5. Gerador de Google Posts com IA (Gemini API — gratuito)
6. Monitor GEO (verificar presença em IAs via Gemini API — gratuito)
7. Ferramenta gratuita de análise (lead magnet /analisar)
8. Sistema de checkout e cobrança recorrente
9. Scripts de prospecção (porta a porta digital)
10. Blog SEO (artigos para aquisição orgânica)

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
Deploy:       Vercel (free tier)
Backend:      Supabase (Auth, Postgres, Edge Functions, Storage) — free tier
Auth:         Supabase Auth com OAuth Google (para conectar Google Business Profile)
IA:           Google Gemini API (free tier — Gemini 2.0 Flash, 15 req/min)
Google:       Google Business Profile API (reviews, posts, insights, locations) — 100% gratuita
Pagamento:    AbacatePay (Pix Automático + cartão) ou Stripe
Jobs/Cron:    Vercel Cron ou Supabase pg_cron
Email:        Resend (free tier: 3k emails/mês)
```

### IMPORTANTE: Estratégia de custo zero no MVP
```
- Google Gemini API free tier: 15 req/min, ~1.500 req/dia no Gemini 2.0 Flash
  → Suficiente para 50+ clientes (respostas a reviews + posts + monitor GEO)
  → Sem necessidade de cartão de crédito para começar
  → SDK: @google/generative-ai (npm)
  → Obter chave em: https://aistudio.google.com/apikey

- Google Business Profile API: 100% gratuita (sem limites práticos para MVP)

- DataForSEO: NÃO usar no MVP. Adicionar só com 50+ clientes pagantes.
  As métricas de busca/visualizações já vêm da Google Business API.

- Supabase free tier: 500MB banco, 50k auth users, 500MB storage
- Vercel free tier: 100GB bandwidth
- Custo total para lançar: R$50 (só o domínio)
```

### Configuração do Gemini API
```typescript
// lib/ai/gemini.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// === GERAR RESPOSTA PARA REVIEW ===
export async function generateReviewResponse(params: {
  reviewText: string;
  rating: number;
  businessName: string;
  businessCategory: string;
  authorName: string;
}) {
  const prompt = `Você é o assistente de atendimento do "${params.businessName}" (${params.businessCategory}).
Gere uma resposta profissional e empática em português brasileiro para esta avaliação do Google:

Autor: ${params.authorName}
Nota: ${params.rating}/5
Texto: "${params.reviewText}"

Regras:
- Se nota >= 4: agradeça genuinamente, mencione algo específico da review, convide para voltar
- Se nota <= 3: peça desculpas, mostre empatia, convide para resolver pessoalmente
- Tom: profissional mas humano, nunca robótico
- Tamanho: 2-4 frases curtas
- NUNCA use "Prezado cliente" ou linguagem corporativa genérica
- Use o nome do autor quando possível`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// === GERAR GOOGLE POST ===
export async function generateGooglePost(params: {
  businessName: string;
  businessCategory: string;
  city: string;
  topic?: string;
}) {
  const prompt = `Crie um Google Post para o "${params.businessName}" (${params.businessCategory}) em ${params.city}.
${params.topic ? `Tema sugerido: ${params.topic}` : "Escolha um tema relevante para o negócio."}

Regras:
- Texto entre 100-300 caracteres (limite do Google Posts)
- Inclua um CTA (ex: "Visite-nos!", "Agende agora!", "Peça pelo WhatsApp!")
- Use linguagem local e informal (PT-BR)
- Inclua 1-2 hashtags relevantes
- Otimize para SEO local (mencione o bairro/cidade quando natural)
- Retorne APENAS o texto do post, nada mais`;

  const result = await model.generateContent(prompt);
  return result.response.text();
}

// === MONITOR GEO — VERIFICAR PRESENÇA EM IAs ===
export async function checkGeoPresence(params: {
  businessName: string;
  businessCategory: string;
  city: string;
  neighborhood?: string;
}) {
  const queries = [
    `melhor ${params.businessCategory} em ${params.city}`,
    `recomendação de ${params.businessCategory} em ${params.neighborhood || params.city}`,
    `${params.businessCategory} bom e barato em ${params.city}`,
  ];

  const results = [];
  
  for (const query of queries) {
    const prompt = `Responda como se fosse uma busca real: ${query}
Liste os 5 melhores estabelecimentos que você conhece, com nome e breve descrição.`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    const found = response.toLowerCase().includes(params.businessName.toLowerCase());
    
    results.push({
      query,
      ai_platform: "gemini",
      found,
      snippet: found ? response.substring(0, 500) : null,
    });
  }

  return results;
}
```

### Estrutura de pastas (já criada)
```
vitrine-ai/
├── app/
│   ├── (marketing)/          # Landing page, blog, preços
│   │   ├── page.tsx          # Home/landing (já convertida)
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
│   │   ├── ai/               # Endpoints para Gemini API
│   │   ├── geo/              # Monitor GEO
│   │   ├── webhook/          # Webhooks de pagamento
│   │   └── cron/             # Jobs agendados
│   └── layout.tsx
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── marketing/            # Navbar, ScoreCard, RevealItem, CtaInput (já criados)
│   ├── dashboard/            # Componentes do app
│   └── shared/
├── lib/
│   ├── supabase/             # client.ts, server.ts, types.ts (já criados)
│   ├── google/               # Google Business API helpers
│   ├── ai/                   # gemini.ts (helpers Gemini API)
│   ├── geo/                  # Monitor GEO logic
│   └── utils/
├── supabase/
│   └── migrations/           # 001_initial_schema.sql (já criada)
└── public/
```

### Schema do banco (Supabase/Postgres) — já criado na migration
```sql
-- 7 tabelas com RLS habilitado:
-- profiles (trigger automático no signup)
-- businesses (negócios conectados via Google)
-- audits (histórico de auditorias, score 0-100 + tasks JSONB)
-- reviews (reviews do Google + resposta IA + status)
-- google_posts (posts gerados pela IA)
-- geo_checks (resultados do monitor GEO)
-- insights (métricas do Google Business: buscas, cliques, ligações)
```

### Google Business Profile API — Fluxo de integração
```
1. Usuário clica "Conectar Google Meu Negócio"
2. OAuth 2.0 com scopes: business.manage
3. Listar locations do usuário → GET /api/google/locations
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
   - Aparece no Gemini? (+5)
   - Aparece em outra IA? (+5)
   - Aparece em 3+ IAs? (+5)
```

### Monitor GEO — Como funciona
```
Para cada negócio, gerar queries tipo:
- "melhor {categoria} em {cidade}"
- "recomendação de {categoria} em {bairro}"
- "{categoria} perto de {endereço}"

MVP: Enviar essas queries para Google Gemini API (free tier):
- Gemini responde com recomendações
- Verificar se o negócio do usuário é mencionado na resposta
- Salvar resultado em geo_checks com: found, position, snippet

Futuro (quando tiver receita): adicionar OpenAI API e Perplexity API para
verificar presença real no ChatGPT e no Perplexity.
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
- Margem bruta: ~92% (custo quase zero com Gemini free tier)
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

### Semana 1-2: Fundação ✅ (parcialmente concluído)
- [x] Setup Next.js 14 + Tailwind + shadcn/ui
- [x] Estrutura de pastas + middleware de auth
- [x] Supabase client/server + types
- [x] Migration SQL (7 tabelas + RLS)
- [x] Landing page convertida para Next.js
- [ ] Configurar Supabase (criar projeto + rodar migration)
- [ ] Preencher .env.local com chaves reais
- [ ] Dashboard de auditoria (score + barras + checklist)
- [ ] Integrar Google Business Profile API (OAuth + locations)
- [ ] Começar prospecção porta a porta com 50 negócios

### Semana 3: IA (Gemini API — custo zero)
- [ ] npm install @google/generative-ai
- [ ] Criar lib/ai/gemini.ts com helpers (código completo acima neste doc)
- [ ] Motor de respostas IA para reviews (Gemini 2.0 Flash)
- [ ] Gerador de Google Posts com IA (Gemini 2.0 Flash)
- [ ] Página app/(app)/reviews com interface de responder reviews
- [ ] Página app/(app)/posts com interface de gerar/agendar posts

### Semana 4: GEO + Lançamento
- [ ] Monitor GEO via Gemini API (consultar e verificar menções)
- [ ] Página app/(app)/geo com relatório visual
- [ ] Checkout com AbacatePay ou Stripe
- [ ] Onboarding flow (conectar Google → selecionar negócio → primeira auditoria)
- [ ] Lançar para 10 clientes beta (trial 14 dias)

### Mês 2: Tração
- [ ] Converter betas em pagantes
- [ ] Ferramenta gratuita de análise (lead magnet /analisar)
- [ ] 5 artigos SEO para o blog
- [ ] Primeiras parcerias com agências
- [ ] Meta: 30-50 clientes

### Mês 3: Escala
- [ ] Plano Agência com white-label
- [ ] Adicionar OpenAI + Perplexity API ao monitor GEO (quando receita justificar)
- [ ] Considerar DataForSEO para heat map de ranking (quando receita justificar)
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

# Google Business Profile API (OAuth para conectar perfil do usuário)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Google Gemini API (IA — FREE TIER)
GEMINI_API_KEY=
# Obter em: https://aistudio.google.com/apikey
# Free tier: 15 requests/min no Gemini 2.0 Flash
# Não precisa de cartão de crédito

# Pagamento (adicionar quando lançar)
# ABACATEPAY_API_KEY=
# ou STRIPE_SECRET_KEY=

# Email (adicionar quando lançar)
# RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# === ADICIONAR DEPOIS (quando tiver receita) ===
# OPENAI_API_KEY=           # Para monitor GEO real no ChatGPT (~$20/mês)
# ANTHROPIC_API_KEY=        # Para melhor qualidade de respostas (~$20/mês)
# DATAFORSEO_LOGIN=         # Para heat map de ranking (~$50/mês)
# DATAFORSEO_PASSWORD=
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
- Google Gemini API tem free tier generoso (15 req/min, sem cartão)
- Zero ferramentas brasileiras de GEO (aparecer em IAs generativas)
- Concorrentes gringos: Semrush ($139/mês), BrightLocal ($39-79/mês), Localo (~$29/mês) — todos em inglês

---

## Escalonamento de custos (quando crescer)

| Clientes | Gemini API | Infra | Total custo | Receita | Margem |
|----------|-----------|-------|-------------|---------|--------|
| 0-50     | R$ 0 (free) | R$ 0 | R$ 0 | R$ 0-4.950 | ~100% |
| 50-100   | R$ 0-50 | R$ 130 | ~R$ 180 | R$ 4.950-9.900 | ~98% |
| 100-500  | R$ 50-200 | R$ 260 | ~R$ 460 | R$ 9.900-49.500 | ~95% |
| 500+     | Migrar Groq/OpenRouter | R$ 500+ | ~R$ 1.500 | R$ 49.500+ | ~97% |

---

## Arquivos de referência

- Landing page Next.js: componentes Navbar, ScoreCardMockup, RevealItem, CtaInput
- `supabase/migrations/001_initial_schema.sql` — 7 tabelas com RLS
- `lib/supabase/client.ts`, `server.ts`, `types.ts` — clientes Supabase
- `middleware.ts` — proteção de rotas autenticadas