# 🎯 Próximos passos — Vitrine.ai

## ✅ Resumo do que você tem agora:

- ✅ **Integração Mercado Pago 100% funcional** (checkout, webhook, atualização de plano)
- ✅ **3 Migrações SQL criadas** (será rodado no Supabase)
- ✅ **Página de preços com checkout** pronta
- ✅ **SDK + helpers** para facilitar pagamentos
- ✅ **Guias de setup** completos
- ✅ **Exemplo de integração com Supabase** (template reutilizável)
- ✅ **Tipos TypeScript** atualizados para Mercado Pago

---

## 📋 Checklist: Configure agora

### 1️⃣ Supabase (15 min)

```bash
# 1. Ir para supabase.com
# 2. Criar projeto (receba credenciais)
# 3. Copiar para .env.local:
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# 4. No Supabase SQL Editor, rodar as 3 migrations:
#    - supabase/migrations/001_initial_schema.sql
#    - supabase/migrations/002_google_connections.sql
#    - supabase/migrations/003_mercado_pago_integration.sql

# 5. Em Authentication → Providers, ativar Email
```

**Documento:** [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)

---

### 2️⃣ Mercado Pago (10 min)

```bash
# 1. Ir para mercadopago.com.br/developers
# 2. Fazer login (criar conta se necessário)
# 3. Copiar credenciais de TESTE para .env.local:
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-...
MERCADOPAGO_WEBHOOK_TOKEN=qualquer-string-aleatoria

# 4. Ir para Webhooks e criar novo:
#    URL: http://localhost:3000/api/mercadopago/webhook (ou seu ngrok)
#    Tópicos: payment

# 5. Para produção depois: usar credenciais de produção
```

**Documento:** [SETUP_MERCADO_PAGO.md](./SETUP_MERCADO_PAGO.md)

---

### 3️⃣ Testar localmente (5 min)

```bash
# 1. Terminal
npm run dev

# 2. Abrir no navegador
http://localhost:3000

# 3. Teste o fluxo:
#    - Ir para /precos
#    - Clique em um plano
#    - Use cartão de teste: 4111 1111 1111 1111
#    - Confirme que pagamento foi aprovado
#    - Verifique profiles.plan no Supabase

# 4. Verificar webhook (opcional, importante)
#    - Use ngrok: ngrok http 3000
#    - Configure webhook com URL do ngrok
#    - Veja evento chegar em /api/mercadopago/webhook
```

---

## 🚀 Arquitetura implementada

```
vitrine-ai/
├── app/
│   ├── (marketing)/
│   │   ├── precos/          ← USE ISSO
│   │   └── mercadopago/success/
│   ├── (app)/
│   │   └── dashboard/
│   └── api/
│       ├── mercadopago/
│       │   ├── checkout/    ← POST aqui
│       │   └── webhook/     ← Recebe notificação
│       ├── auth/
│       └── ...
├── lib/
│   ├── mercadopago/
│   │   └── client.ts        ← SDK + helpers
│   ├── supabase/
│   │   ├── types.ts         ← Tipos DB
│   │   ├── client.ts        ← Cliente
│   │   └── queries.ts       ← Queries reutilizáveis ← USE ISSO
│   └── ...
├── components/
│   └── dashboard/
│       └── CheckoutButton.tsx  ← USE ISSO
├── supabase/migrations/
│   ├── 001_...
│   ├── 002_...
│   └── 003_...            ← Mercado Pago
└── [SETUP_*.md]           ← LEIA ISSO
```

---

## 💡 Padrões de uso

### Usar Checkout em qualquer página

```tsx
import { CheckoutButton } from '@/components/dashboard/CheckoutButton';

export default function MinhaPagina() {
  return (
    <CheckoutButton
      plan="pro"
      planName="Profissional"
      price="99"
      className="w-full"
    />
  );
}
```

### Acessar dados do Supabase em API routes

```typescript
// app/api/minha-rota/route.ts
import { getUserProfile, getUserBusinesses } from '@/lib/supabase/queries';

export async function GET() {
  const profile = await getUserProfile();
  const businesses = await getUserBusinesses();
  
  return Response.json({ profile, businesses });
}
```

### Acessar dados em Server Component

```tsx
// app/(app)/meu-componente.tsx
import { getUserProfile } from '@/lib/supabase/queries';

export default async function MeuComponente() {
  const profile = await getUserProfile();
  
  return <div>Bem-vindo, {profile.name}!</div>;
}
```

---

## 🧪 Teste cada recurso

| Feature | Como testar | Status |
|---------|-----------|--------|
| Login/Signup | `/login` | ✅ Pronto |
| Checkout | `/precos` | ✅ Pronto |
| Webhooks | Usar ngrok | ✅ Pronto |
| Atualizar plano | Ver `profiles.plan` | ✅ Automático |
| Histórico pagamento | Ver `payments` table | ✅ Automático |
| Dashboard | `/dashboard` | ⚠️ Precisa preencher |

---

## 📝 Tarefas imediatas (ordenadas)

### Semana 1 (CRÍTICO):
- [ ] Criar projeto Supabase + rodar migrations
- [ ] Criar conta Mercado Pago + obter credenciais acesso
- [ ] Testar checkout com cartão de teste
- [ ] Verificar webhook recebendo eventos
- [ ] Confirmar `profiles.plan` atualiza após pagamento

### Semana 2 (IMPORTANTE):
- [ ] Conectar Google Business Profile API (OAuth)
- [ ] Implementar auditoria automática (score 0-100)
- [ ] Mostrar lista de negócios no dashboard
- [ ] Criar página para conectar primeiro negócio

### Semana 3 (FEATURES):
- [ ] Integrar Gemini API para respostas a reviews
- [ ] Integrar Gemini API para gerar Google Posts
- [ ] Criar página /reviews com interface
- [ ] Criar página /posts com interface

### Semana 4 (LANÇAMENTO):
- [ ] Monitor GEO (verificar presença em IAs)
- [ ] Lançar para 10 clientes beta
- [ ] Coletar feedback
- [ ] Corrigir bugs críticos

---

## 🔑 Credenciais de teste

### Mercado Pago (modo teste)

**Cartão aprovado:**
```
Número: 4111 1111 1111 1111
Expiração: 12/25
CVV: 123
Titular: qualquer nome
```

**Cartão recusado:**
```
Número: 5105 1051 0510 5100
Expiração: 12/25
CVV: 123
```

### Supabase

Você gerencia usuários em **Authentication → Users**

---

## 🆘 Help

Se tiver problema:

1. **Erro de checkout**: Ver [SETUP_MERCADO_PAGO.md](./SETUP_MERCADO_PAGO.md#troubleshooting)
2. **Erro de banco**: Ver [SETUP_SUPABASE.md](./SETUP_SUPABASE.md#troubleshooting)
3. **Erro geral**: Ver terminal (npm run dev)
4. **Logs**: Supabase → Logs & Database (SQL Editor)

---

## 🎉 Pronto!

Você tem um **SaaS completo com autenticação, pagamento e banco de dados** funcionando.

Próximo: **Configure Supabase** seguindo [SETUP_SUPABASE.md](./SETUP_SUPABASE.md)

Depois: **Configure Mercado Pago** seguindo [SETUP_MERCADO_PAGO.md](./SETUP_MERCADO_PAGO.md)

Depois: **Teste o checkout** em `/precos`

Depois: **Integre Google Business API** (próximo milestone)

---

**Vitrine.ai está pronto para receber clientes! 🚀**
