# 🎯 Plano: Remover Mockups e Usar Dados Reais

**Status:** 📋 Planning  
**Prioridade:** P0 (Bloqueia MVP)  
**Estimativa:** 3-4 horas de desenvolvimento

---

## 📍 Mockups Encontrados (8 locais)

### 1. Landing Page — ScoreCardMockup
**Arquivo:** `components/marketing/ScoreCardMockup.tsx` (95 linhas)

**O que é:**
- Componente estático com dados hardcoded
- Exibe score 42/100 para "Casa da Pizza"
- Barras com valores fixos (75%, 45%, 15%, 0%, 40%)
- Tasks fixas de exemplo

**Problema:**
- Landing page (/landing) mostra sempre os mesmos dados
- Usuário novo não vê seu negócio

**Solução:**
```typescript
// ✅ APÓS: Dinâmico baseado em login
if (user) {
  // Se usuário logado, buscar primeiro negócio e última auditoria
  const businesses = await getBusinesses();
  const audit = await getLatestAudit(businesses[0].id);
  // Renderizar ScoreCard com dados reais
} else {
  // Se sem login, mostrar exemplo genérico (OK)
  return <ScoreCardMockup />; // Continua como exemplo
}
```

**Impacto:** Baixo (landing page é OK com exemplo)

---

### 2. Reviews — MOCK_REVIEWS
**Arquivo:** `app/(app)/reviews/page.tsx` (linhas 18-89)

**O que é:**
- Array hardcoded com 6 reviews fake de "Casa da Pizza"
- Dados: Maria Silva (5⭐), João Pereira (2⭐), etc
- Status mock: "pending", "responded"

**Problema:**
- Usuário acessa /reviews e vê reviews fake, não dele
- Nenhuma conexão com Google Business API
- Nenhuma conexão com banco de dados real

**Solução:**
```typescript
// Trocar de MOCK_REVIEWS para query real:
const { data: reviews } = await supabase
  .from('reviews')
  .select('*')
  .eq('business_id', businessId)
  .order('created_at', { ascending: false });
```

**Impacto:** Alto (página principal do app)

---

### 3. Posts — MOCK_POSTS
**Arquivo:** `app/(app)/posts/page.tsx` (linhas 19-57)

**O que é:**
- Array com 2 posts fake
- Posts com timestamps mock ("Há 11 dias", etc)
- Views hardcoded (312, 198)

**Problema:**
- Não sincroniza com Google Business API
- Usuário não vê posts reais dele

**Solução:**
```typescript
// Trocar de MOCK_POSTS para query:
const { data: posts } = await supabase
  .from('google_posts')
  .select('*')
  .eq('business_id', businessId)
  .order('published_at', { ascending: false });
```

**Impacto:** Alto

---

### 4. Auditoria — MOCK CATEGORIES + ITEMS
**Arquivo:** `app/(app)/auditoria/page.tsx` (linhas 18-65)

**O que é:**
- Array AUDIT_CATEGORIES com dados hardcoded
- Scores fixos: fotos=21/25, info=22/25, reviews=12/20, posts=8/15, geo=6/15
- Items (checklists) com status done/false fixos

**Problema:**
- Scorecard não é do usuário, é fake
- Não calcula score baseado em dados reais do Google

**Solução:**
```typescript
// Buscar auditoria real:
const { data: audit } = await supabase
  .from('audits')
  .select('*')
  .eq('business_id', businessId)
  .order('created_at', { ascending: false })
  .limit(1)
  .single();

// Renderizar com dados de audit.score e audit.checklist
```

**Impacto:** Crítico (feature principal)

---

### 5. Geo Monitor — MOCK PLATFORMS
**Arquivo:** `app/(app)/geo/page.tsx` (linhas 15-80)

**O que é:**
- Array PLATFORMS com 5 plataformas (Gemini, ChatGPT, Perplexity, Copilot, AI Overviews)
- Dados simulados de encontrado/não encontrado
- Queries e snippets hardcoded

**Problema:**
- Não testa presença real em IAs
- Dados fake de "encontrado" ou "não encontrado"
- Não integra com Google Gemini API

**Solução:**
```typescript
// Buscar geo_checks reais:
const { data: geoChecks } = await supabase
  .from('geo_checks')
  .select('*')
  .eq('business_id', businessId)
  .order('checked_at', { ascending: false });
```

**Impacto:** Alto (feature diferencial)

---

### 6. MOCK_BUSINESS (Multiple Pages)
**Localização:**
- `reviews/page.tsx:91` — const MOCK_BUSINESS
- `posts/page.tsx:59` — const MOCK_BUSINESS
- `geo/page.tsx:82` — Hardcoded em queries

**O que é:**
```typescript
const MOCK_BUSINESS = {
  name: "Casa da Pizza",
  category: "Restaurante",
  city: "São Paulo",
  state: "SP",
};
```

**Problema:**
- Todas as páginas usam mesmo negócio fake
- Sem connection com dados do usuário autenticado
- Sem flexibilidade para múltiplos negócios

**Solução:**
```typescript
// Buscar negócio real do usuário:
const business = await getBusiness(businessId); // Real data
// Usar: business.name, business.category, etc
```

**Impacto:** Crítico

---

### 7. Configurações — Notifications Mock
**Arquivo:** `app/(app)/configuracoes/page.tsx` (linhas 131-135)

**O que é:**
```typescript
const [notifications, setNotifications] = useState({
  newReview: true,
  weeklyReport: true,
  geoAlert: false,
  tips: true,
});
```

**Problema:**
- Não persiste preferências no banco
- Estado local só, não salva quando reload

**Solução:**
```typescript
// Salvar em tabela user_preferences no Supabase
await supabase
  .from('user_preferences')
  .update({ notifications })
  .eq('user_id', userId);
```

**Impacto:** Médio (feature secundária)

---

### 8. Radar Local GEO — generateMockGrid
**Arquivo:** `lib/geo/radar-local.ts` (linhas 39-80)

**O que é:**
```typescript
export function generateMockGrid(keyword: string): GridCell[][] {
  // Gera grid 7x7 com rankings fake
  // Usa seed baseado em keyword para parecer determinístico
}
```

**Problema:**
- Fallback quando não há dados no DB
- Nunca testa dados reais de ranking

**Solução:**
- Remover fallback de mock
- Sempre devolve grid vazio se sem dados reais
- Ou usar Supabase para buscar geo_rankings reais

**Impacto:** Baixo (usa como fallback)

---

## 🗂️ Arquivos que Usam Mockups

| Arquivo | Tipo | Mockups | Prioridade |
|---------|------|---------|-----------|
| `components/marketing/ScoreCardMockup.tsx` | Componente | score/bars/tasks hardcoded | P2 (OK como exemplo) |
| `app/(app)/reviews/page.tsx` | Page | MOCK_REVIEWS (6 items) | **P0** |
| `app/(app)/posts/page.tsx` | Page | MOCK_POSTS (2 items) | **P0** |
| `app/(app)/auditoria/page.tsx` | Page | AUDIT_CATEGORIES + items | **CRITICAL** |
| `app/(app)/geo/page.tsx` | Page | PLATFORMS (5 plataformas) | **P0** |
| `app/(app)/configuracoes/page.tsx` | Page | notifications state | P2 |
| `lib/geo/radar-local.ts` | Utility | generateMockGrid() | P1 |
| `scripts/seed-test-data.ts` | Script | Test data factory | OK (manter) |

---

## ✅ Plano de Implementação

### Fase 1: Setup (30 min) — Prerequisites
- [ ] Confirmar que tabelas Supabase estão criadas
- [ ] Confirmar que migrations foram rodadas
- [ ] Confirmar .env.local tem credenciais reais
- [ ] Rodar `npm run seed` para popular DB com teste data

### Fase 2: API Queries (45 min) — Data Fetching
- [ ] Melhorar `lib/supabase/queries.ts`:
  - [ ] `getLatestAudit(businessId)` — Buscar última auditoria
  - [ ] `getReviews(businessId)` — Buscar reviews com paginação
  - [ ] `getGooglePosts(businessId)` — Buscar posts
  - [ ] `getGeoChecks(businessId)` — Buscar GEO checks
  - [ ] `getInsights(businessId)` — Buscar insights

### Fase 3: Remove Mockups (1.5 horas) — Replace with Real Data
- [ ] **3.1:** Remove MOCK_REVIEWS de `/reviews` → query real
- [ ] **3.2:** Remove MOCK_POSTS de `/posts` → query real
- [ ] **3.3:** Remove MOCK CATEGORIES de `/auditoria` → query real
- [ ] **3.4:** Remove MOCK PLATFORMS de `/geo` → query real
- [ ] **3.5:** Remove MOCK_BUSINESS de todas páginas → usar business real
- [ ] **3.6:** Remove generateMockGrid fallback

### Fase 4: Testes (30 min) — E2E Validation
- [ ] [ ] Login com teste@vitrine-ai.local
- [ ] [ ] Dashboard carrega dados reais
- [ ] [ ] /reviews mostra reviews reais
- [ ] [ ] /posts mostra posts reais
- [ ] [ ] /auditoria mostra score real
- [ ] [ ] /geo mostra GEO checks reais
- [ ] [ ] Navegar sem erros

### Fase 5: Polish (15 min) — UX Improvements
- [ ] [ ] Add loading states enquanto busca dados
- [ ] [ ] Empty states (sem dados ainda)
- [ ] [ ] Error handling se falhar query
- [ ] [ ] Skeleton loaders (opcional)

---

## 🔧 Código-Chave para Implementar

### lib/supabase/queries.ts — Add estas funções

```typescript
// Buscar última auditoria
export async function getLatestAudit(businessId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('audits')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  return data;
}

// Buscar reviews
export async function getReviews(businessId: string, limit = 50) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('reviews')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return data || [];
}

// Buscar posts
export async function getGooglePosts(businessId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('google_posts')
    .select('*')
    .eq('business_id', businessId)
    .order('published_at', { ascending: false });
  return data || [];
}

// Buscar GEO checks
export async function getGeoChecks(businessId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('geo_checks')
    .select('*')
    .eq('business_id', businessId)
    .order('checked_at', { ascending: false });
  return data || [];
}

// Buscar insights
export async function getInsights(businessId: string) {
  const supabase = await createServerClient();
  const { data } = await supabase
    .from('insights')
    .select('*')
    .eq('business_id', businessId)
    .order('metric_date', { ascending: false })
    .limit(30);
  return data || [];
}
```

### app/(app)/reviews/page.tsx — Transform

```typescript
// ❌ Remover:
const MOCK_REVIEWS = [...]

// ✅ Adicionar:
export default async function ReviewsPage() {
  const user = await getUser();
  const businesses = await getUserBusinesses();
  const business = businesses[0];
  
  // Query real
  const reviews = await getReviews(business.id);
  
  if (!reviews.length) {
    return <EmptyState message="Nenhuma review ainda" />;
  }
  
  return <ReviewsList reviews={reviews} businessId={business.id} />;
}
```

---

## 📊 Checklist Final

- [ ] Todas 8 localidades com mockups foram identificadas
- [ ] Queries para dados reais estão prontas
- [ ] Seed data foi popular o DB
- [ ] Todas páginas migradas para dados reais
- [ ] Testes manuais todas features
- [ ] Sem erros no console
- [ ] Sem referências a MOCK_* no código
- [ ] `/reviews`, `/posts`, `/geo`, `/auditoria` mostram dados reais

---

**Próximo Passo:** Escolha por onde começar (recomendado: Fase 1 + 2, depois 3)

Quer que eu comece com qual parte?
