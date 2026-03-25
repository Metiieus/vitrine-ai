# SETUP TOKEN REFRESH — Configuração de Renovação Automática de Tokens Google

## 📋 Problemas Resolvidos

- ✅ **Expiração de tokens Google:** Access tokens do Google OAuth expiram em 3600s (1 hora)
- ✅ **Falhas silenciosas:** APIs do Google podem falhar sem avisar após expiry
- ✅ **Experiência do usuário:** Sem refresh automático, sessões > 1h exigem re-login
- ✅ **Operação autônoma:** Cron job valida + renova tokens enquanto o usuário usa o app

---

## 🔧 Arquitetura

### 1. **Módulo de Token Refresh** (`lib/google/token-refresh.ts`)
Contém 4 funções principais:

```typescript
// Gera novo access token a partir do refresh token
async function refreshGoogleToken(userId, refreshTokenEncrypted)
  → { newAccessToken, expires_at_unix }

// Pre-flight validation: verifica se token vai expirar em < 5 min
async function ensureTokenValid(userId)
  → { valid: boolean, error?: string }

// Batch job: encontra todos os tokens expirando em < 1h e renova
async function refreshExpiredTokens(hoursThreshold = 1)
  → { renewed: number, failed: number, errors: [...] }

// Helpers para criptografia de tokens em repouso
encryptToken(plaintext) → ciphertext
decryptToken(ciphertext) → plaintext
```

### 2. **Cron Job** (`app/api/cron/google-token-refresh/route.ts`)
- **Rota:** `GET /api/cron/google-token-refresh`
- **Frequência:** A cada 1 hora (configurado em `vercel.json`)
- **Autenticação:** Requer header `Authorization: Bearer {CRON_SECRET}`
- **Workflow:**
  1. Valida CRON_SECRET (timing-safe comparison)
  2. Chama `refreshExpiredTokens(hoursThreshold = 1)`
  3. Renova todos os tokens expirando em < 1 hora automáticamente
  4. Logs de sucesso/erro para debug

### 3. **Integração em Endpoints**
Adicionado em 3 endpoints que usam tokens Google:

- ✅ `GET /api/google/reviews` — Puxa reviews
- ✅ `GET /api/google/insights` — Puxa métricas
- ✅ `GET /api/google/locations` — Lista negócios

**Padrão de integração:**
```typescript
// Após autenticação do usuário (user.id), antes de usar token:
const tokenCheck = await ensureTokenValid(user.id);
if (!tokenCheck.valid) {
  return internalError(new Error("Google token expired or unavailable"));
}
// Continua normalmente com getGoogleFetch(user.id)
```

---

## 🚀 Setup Passo a Passo

### **Passo 1: Gerar CRON_SECRET**

No terminal (qualquer OS):

```bash
# macOS/Linux
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Max 256 }))

# Ou copie um exemplo (NUNCA use em produção):
# 0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
```

Guarde a string de 64 caracteres (hex).

---

### **Passo 2: Configurar Upstash Redis**

#### **2.1 Criar conta**
1. Vá para https://console.upstash.com/
2. Sign up (pode usar GitHub/Google)
3. No dashboard, clique **"Create Database"**

#### **2.2 Criar banco Redis**
1. **Name:** `vitrine-ai-ratelimit` (ou outro nome)
2. **Type:** Redis Database
3. **TLS:** ✅ Habilitado (padrão, seguro)
4. **Clique:** "Create Database"

#### **2.3 Obter credenciais**
Na página do banco criado:
- Copie **"REST API URL"** (ex: `https://happy-duck-12345.upstash.io`)
- Copie **"REST Token"** (ex: `AX8AACInc2l4...`)

---

### **Passo 3: Atualizar `.env.local`**

No arquivo `.env.local`:

```env
# ← Manter as outras variáveis acima

# Rate Limiting — Upstash Redis
UPSTASH_REDIS_REST_URL=https://happy-duck-12345.upstash.io
UPSTASH_REDIS_REST_TOKEN=AX8AACInc2l4YWZmZWluZWQtZGVlcC1yZWFsX2ZXNW9uaVJFQzFqVWo0ZHNXQg0KNTEyMDE5Njk4

# Cron Jobs
CRON_SECRET=0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a
```

---

### **Passo 4: Deploy no Vercel**

1. Faça commit e push do `vercel.json` (novo arquivo com cron config)

```bash
git add vercel.json .env.local
git commit -m "feat: adicionar refresh automático de tokens Google com cron"
git push origin main
```

2. Fa login no Vercel:
   ```bash
   npm install -g vercel
   vercel login
   ```

3. Link seu projeto:
   ```bash
   vercel link
   # Selecione seu projeto
   ```

4. Adicione variáveis de ambiente no Vercel dashboard:
   - **Projeto > Settings > Environment Variables**
   - Adicione:
     - `UPSTASH_REDIS_REST_URL` = seu URL
     - `UPSTASH_REDIS_REST_TOKEN` = seu token
     - `CRON_SECRET` = sua secret (64 hex chars)

5. Deploy:
   ```bash
   vercel deploy --prod
   ```

---

## 📊 Fluxo de Funcionamento

### **Cenário: Usuário Conecta Google**

```
1. User clica "Conectar Google Meu Negócio"
   ↓
2. OAuth com Google (user concede permissão)
   ↓
3. Supabase salva:
   - google_connections.access_token (CRIPTOGRAFADO)
   - google_connections.refresh_token (CRIPTOGRAFADO)
   - google_connections.expires_at_unix (3600 segundos = 1 hora)
   ↓
4. User faz ações no app (ver reviews, posts, etc)
   ↓
5. Todo request chama getGoogleFetch(user.id)
   → Que lê o access_token do banco → Usa na API do Google
```

### **Cenário: Token está prestes a expirar**

```
1. Cron job dispara a cada 1 hora (0 * * * * em UTC)
   ↓
2. GET /api/cron/google-token-refresh (com header Authorization: Bearer {CRON_SECRET})
   ↓
3. refreshExpiredTokens(hoursThreshold = 1) executa:
   → SELECT * FROM google_connections WHERE expires_at_unix < NOW() + 1 hour
   → Para cada connection: chama refreshGoogleToken()
   → Faz POST para https://oauth2.googleapis.com/token
   → Recebe novo access_token + novo expires_at
   → Criptografa e salva no banco
   ↓
4. Quando user faz request (GET /api/google/reviews):
   → ensureTokenValid(user.id) valida que token NÃO está expirado
   → Se expira em < 5 min: renova automaticamente (single-request refresh)
   → Usa token fresco para chamar Google API
   → Response bem-sucedida ✅
```

---

## 🔐 Segurança

### **Tokens em Repouso (Storage)**
- ✅ Access tokens salvos CRIPTOGRAFADOS no Supabase
- ✅ Refresh tokens salvos CRIPTOGRAFADOS no Supabase
- ✅ Chave de criptografia (`GOOGLE_TOKEN_ENCRYPTION_KEY`) em `.env.local` (nunca em código)
- ✅ Algoritmo: AES-256-GCM (military-grade encryption)

### **Cron Job**
- ✅ Requer `CRON_SECRET` valido (bearer token)
- ✅ Validação timing-safe (previne timing attacks)
- ✅ Apenas Vercel pode chamar (você configura a secret)
- ✅ Logs de segurança para tentativas falhadas

### **Endpoints Google API**
- ✅ Pre-flight token validation com `ensureTokenValid()`
- ✅ Recuperação automática se token expirou
- ✅ Erros genéricos para cliente (não expõe detalhes internos)

---

## 🐛 Debug & Troubleshooting

### **Verificar se cron está rodando**

1. Vercel dashboard → Projeto → **"Deployments"**
2. Click no deploy mais recente
3. Aba **"Functions"** mostra logs de `/api/cron/google-token-refresh`

### **Testar manualmente (local)**

```bash
# Gerar um CRON_SECRET temporário
openssl rand -hex 32

# Copiar para .env.local
CRON_SECRET=seu_novo_secret_aqui

# Chamar cron manualmente
curl -H "Authorization: Bearer seu_novo_secret_aqui" \
  http://localhost:3000/api/cron/google-token-refresh

# Resposta esperada:
# { "success": true, "renewed": 2, "failed": 0 }
```

### **Logs de erro comuns**

| Erro | Causa | Solução |
|------|-------|---------|
| `401 Unauthorized` | CRON_SECRET inválido | Verificar `.env.local` → Gerar novo secret |
| `Redis connection failed` | Upstash não configurado | Verificar UPSTASH_REDIS_REST_URL e token |
| `Token refresh failed` | Google API desconectada | Verificar GOOGLE_CLIENT_ID/SECRET válidos |
| `Decryption error` | GOOGLE_TOKEN_ENCRYPTION_KEY errada | Regenerar key (nunca mude em produção) |

---

## 📝 Checklist de Setup

- [ ] Gerar CRON_SECRET via `openssl rand -hex 32`
- [ ] Criar banco Redis em https://console.upstash.com/
- [ ] Copiar UPSTASH_REDIS_REST_URL e token
- [ ] Atualizar `.env.local` com 3 novas variáveis
- [ ] Fazer commit de `vercel.json`
- [ ] Deploy no Vercel
- [ ] Adicionar variáveis no Vercel dashboard (Project > Settings)
- [ ] Testar cron localmente (curl)
- [ ] Verificar logs no Vercel dashboard após 1ª hora

---

## 📚 Referências

- **Google OAuth Refresh:** https://developers.google.com/identity/protocols/oauth2#expiration
- **Upstash Redis:** https://upstash.com/docs/redis/features/ratelimiting
- **Vercel Cron:** https://vercel.com/docs/cron-jobs
- **AES-256-GCM:** https://nodejs.org/api/crypto.html#crypto_crypto_createcipheriv_algorithm_key_iv_authtag

---

**Status:** ✅ Implementação completa. Aguardando setup de variáveis de ambiente.
