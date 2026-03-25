# 📑 Árvore de arquivos criados/modificados

## Novos arquivos

### API
```
app/api/mercadopago/
├── checkout/route.ts          [NOVO] POST para criar preferência
└── webhook/route.ts           [NOVO] Receber eventos de pagamento
```

### Pages
```
app/(marketing)/
├── precos/page.tsx            [NOVO] Página de preços + checkout
└── mercadopago/
    └── success/page.tsx       [NOVO] Confirmação de pagamento

app/(app)/
└── dashboard/page.exemplo.tsx [NOVO] Exemplo de integração
```

### Components
```
components/dashboard/
└── CheckoutButton.tsx         [NOVO] Botão reutilizável de checkout
```

### Libraries
```
lib/mercadopago/
├── client.ts                  [NOVO] SDK + helpers do MP
└── types.ts                   [NOVO] Type definitions

lib/supabase/
└── queries.ts                 [NOVO] Queries reutilizáveis
```

### Database
```
supabase/migrations/
└── 003_mercado_pago_integration.sql  [NOVO] Tabelas payments + subscriptions
```

### Documentação
```
SETUP_SUPABASE.md              [NOVO] Guia de configuração
SETUP_MERCADO_PAGO.md          [NOVO] Guia de integração
README.md                      [MODIFICADO] Quick start + estrutura
IMPLEMENTACAO_MP.md            [NOVO] Resumo do que foi feito
PROXIMOS_PASSOS.md             [NOVO] Checklist e próximas tarefas
```

### Configuração
```
.env.local.example             [MODIFICADO] Adicionou vars do MP
```

## Arquivos modificados

### Types
```
lib/supabase/types.ts
- Adicionou: PaymentStatus, SubscriptionStatus
- Adicionou: Database.payments, Database.subscriptions
- Modificou: Database.profiles (stripe → mercadopago)
```

### Package.json
```
package.json
- npm install mercadopago (SDK oficial)
```

---

## 📊 Alterações por categoria

### Backend (API Routes)
| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `app/api/mercadopago/checkout/route.ts` | Novo | POST para gerar link de checkout |
| `app/api/mercadopago/webhook/route.ts` | Novo | Receber eventos do Mercado Pago |

### Frontend (UI)
| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `app/(marketing)/precos/page.tsx` | Novo | Tabela de preços com CTA |
| `app/(marketing)/mercadopago/success/page.tsx` | Novo | Redirecionamento após pagamento |
| `components/dashboard/CheckoutButton.tsx` | Novo | Botão reutilizável |

### Data Layer
| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `lib/mercadopago/client.ts` | Novo | SDK + helpers de pagamento |
| `lib/supabase/queries.ts` | Novo | Queries reutilizáveis ao DB |
| `lib/supabase/types.ts` | Modificado | Tipos para payments/subscriptions |
| `supabase/migrations/003_*.sql` | Novo | Tabelas para MP |

### Documentação
| Arquivo | Tipo | Descrição |
|---------|------|-----------|
| `SETUP_SUPABASE.md` | Novo | Guia passo a passo |
| `SETUP_MERCADO_PAGO.md` | Novo | Configuração do MP |
| `README.md` | Modificado | Quick start |
| `IMPLEMENTACAO_MP.md` | Novo | Resumo técnico |
| `PROXIMOS_PASSOS.md` | Novo | Checklist de ações |

---

## ⚙️ Fluxo de integração

```
1. Usuário acessa /precos
   └── Vê planos com CheckoutButton

2. Clica em "Assinar"
   └── CheckoutButton dispara POST /api/mercadopago/checkout

3. API cria preferência
   └── Usa createPaymentPreference de lib/mercadopago/client.ts
   └── Retorna init_point (link do MP)

4. Usuário é redirecionado para Mercado Pago
   └── Faz pagamento (Pix, boleto, cartão, débito)

5. Mercado Pago envia webhook
   └── POST /api/mercadopago/webhook
   └── Valida assinatura
   └── Se aprovado:
       - Salva em payments table
       - Atualiza profiles.plan
       - Cria/atualiza subscriptions

6. Usuário vê página de sucesso
   └── Redireciona para /dashboard
   └── Dashboard carrega com novo plano ativo
```

---

## 🔑 Variáveis de ambiente adicionadas

```env
# Adicionadas ao .env.local.example
MERCADOPAGO_ACCESS_TOKEN=       # Obter em Mercado Pago
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=
MERCADOPAGO_WEBHOOK_TOKEN=      # Qualquer string aleatória
```

---

## 📊 Tabelas criadas no Supabase

```sql
-- 003_mercado_pago_integration.sql

profiles (modificado)
├── DROP: stripe_customer_id
├── ADD: mercadopago_customer_id
└── ADD: mercadopago_subscription_id

payments (novo)
├── id (UUID)
├── user_id (FK profiles)
├── mercadopago_payment_id (UNIQUE)
├── mercadopago_preference_id
├── status (pending|approved|failed|refunded)
├── amount (numeric)
├── plan (enum)
├── billing_cycle
└── created_at, updated_at

subscriptions (novo)
├── id (UUID)
├── user_id (FK profiles, UNIQUE)
├── mercadopago_subscription_id (UNIQUE)
├── plan (enum)
├── status (active|paused|cancelled)
├── current_period_start/end
├── next_billing_date
└── created_at, updated_at
```

---

## 🚀 Como usar cada arquivo

### Para pagar (cliente)
```tsx
import { CheckoutButton } from '@/components/dashboard/CheckoutButton';

<CheckoutButton plan="pro" planName="..." price="99" />
```

### Para processar pagamento (servidor)
```typescript
import { createPaymentPreference } from '@/lib/mercadopago/client';

const preference = await createPaymentPreference({
  userId: user.id,
  plan: 'pro',
  email: user.email,
});
```

### Para acessar dados do usuário
```typescript
import { getUserProfile, getUserBusinesses } from '@/lib/supabase/queries';

const profile = await getUserProfile();
const businesses = await getUserBusinesses();
```

---

## ✅ Status de implementação

| Feature | Status | Arquivo |
|---------|--------|---------|
| Checkout flow | ✅ 100% | `/precos`, `CheckoutButton` |
| Webhook (MP → DB) | ✅ 100% | `webhook/route.ts` |
| Atualizar plano | ✅ 100% | webhook automático |
| Histórico pagamentos | ✅ 100% | `payments` table |
| Assinatura ativa | ✅ 100% | `subscriptions` table |
| Autenticação | ✅ 100% | Supabase Auth |
| RLS (segurança) | ✅ 100% | Policies em cada tabela |
| Types (TypeScript) | ✅ 100% | `lib/supabase/types.ts` |
| Documentação | ✅ 100% | SETUP_*.md + README |

---

## 🎯 Próximas implementações

- Google Business API (conectar negócios)
- Auditoria automática (score 0-100)
- Motor de IA (Gemini API)
- Monitor GEO (aparecer em IAs)
- Dashboard com dados em tempo real

---

**Todos os arquivos estão prontos para usar! 🎉**

Comece por: [PROXIMOS_PASSOS.md](./PROXIMOS_PASSOS.md)
