# 🚀 Vitrine.ai

**O Maps te mostra. A IA te indica.**

Vitrine.ai é um SaaS de SEO Local + GEO com IA que ajuda negócios físicos (restaurantes, clínicas, salões) a serem encontrados no Google Maps, Google Search e respostas de IAs generativas.

## 📖 Documentação

Toda a documentação está em **`/docs`**:

- **[INDEX.md](./docs/INDEX.md)** — Visão geral e índice
- **[SETUP.md](./docs/SETUP.md)** — Setup do ambiente local
- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** — Stack técnico e estrutura
- **[DATABASE.md](./docs/DATABASE.md)** — Schema PostgreSQL + RLS
- **[SECURITY.md](./docs/SECURITY.md)** — RLS, encryption, validação

**➡️ Comece por [docs/SETUP.md](./docs/SETUP.md)**

---

## 🎯 Projeto

| Item | Descrição |
|------|-----------|
| **Modelo** | SaaS B2B (negócios físicos) |
| **Preço** | R$49-299/mês |
| **Mercado** | 900k+ negócios físicos Brasil |
| **Diferencial** | Única ferramenta de GEO (presença em IAs) |

### Planos
- **Essencial** (R$49/mês): Score auditoria + respostas IA
- **Profissional** (R$99/mês): Tudo + monitor GEO
- **Agência** (R$299/mês): Até 5 perfis + white-label

---

## 💻 Stack Técnico

```
Frontend:     Next.js 14 (React 18 SSR)
Styling:      Tailwind CSS + shadcn/ui
Backend:      Vercel Functions + Supabase
Database:     PostgreSQL 15 + RLS
Auth:         Supabase Auth + OAuth Google
IA:           Anthropic Claude (Sonnet 4.6)
Payments:     Mercado Pago
Rate Limit:   Upstash Redis
```

---

## ✨ Features

| Feature | Status | Descrição |
|---------|--------|-----------|
| 📊 Dashboard Auditoria | ✅ | Score 0-100 + checklist |
| 🤖 Respostas IA | ✅ | Claude gera respostas para reviews |
| 📝 Google Posts | ✅ | Gerador de posts otimizados |
| 🌍 Monitor GEO | ✅ | Verifica presença em ChatGPT/Gemini/Perplexity |
| 💳 Mercado Pago | ✅ | Assinaturas recorrentes |
| 🔐 RLS + Segurança | ✅ | 10/10 tabelas com RLS, score 98/100 |

---

## 🚀 Quick Start

```bash
# 1. Clone
git clone https://github.com/seu-org/vitrine-ai.git
cd vitrine-ai

# 2. Setup
pnpm install
cp .env.local.example .env.local
# Preencha variáveis (ver docs/SETUP.md)

# 3. Dev Server
pnpm dev
# Abrir http://localhost:3000
```

---

## 🔐 Segurança

✅ **Score: 98/100**

- RLS em 100% das tabelas (Supabase)
- Encryption AES-256-GCM para tokens
- Rate limiting (Upstash Redis)
- Validation com Zod
- Prompt injection protection
- Audit logging

Detalhes: [docs/SECURITY.md](./docs/SECURITY.md)

---

## 📊 Status do Projeto

- ✅ Landing page
- ✅ Dashboard auditoria
- ✅ OAuth Google
- ✅ Respostas IA (Claude)
- ✅ Google Posts
- ✅ Monitor GEO
- ✅ Mercado Pago
- ✅ RLS + Segurança completa

**MVP pronto para validação com clientes beta.**

---

## 🤝 Contribuindo

1. Clone o repo
2. Crie branch: `git checkout -b feat/sua-feature`
3. Commit: `git commit -m "feat: descrição"`
4. Push: `git push origin feat/sua-feature`
5. Abra PR

---

## 📞 Suporte

- **Documentação:** [/docs](./docs)
- **Issues:** GitHub Issues
- **Email:** support@vitrine.ai

---

**v1.0.0** | Março 2026
