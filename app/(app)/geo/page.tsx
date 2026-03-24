"use client";

import { useState } from "react";
import {
  Globe,
  Sparkles,
  Loader2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

const PLATFORMS = [
  {
    id: "gemini",
    name: "Google Gemini",
    icon: "G",
    color: "#4285F4",
    found: false,
    lastCheck: "Há 2 horas",
    queries: [
      { query: "melhor pizzaria em Moema", found: false, snippet: null },
      { query: "recomendação de restaurante em Moema SP", found: false, snippet: null },
      { query: "pizzaria boa e barata em São Paulo Moema", found: false, snippet: null },
    ],
    tip: "Adicione sua cidade e bairro na descrição do perfil para aparecer nas respostas do Gemini.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    icon: "C",
    color: "#10A37F",
    found: true,
    lastCheck: "Há 2 horas",
    queries: [
      { query: "melhor pizzaria em Moema São Paulo", found: true, snippet: "Casa da Pizza em Moema é frequentemente citada como uma das melhores da região, conhecida pela massa crocante e ingredientes frescos." },
      { query: "onde comer pizza em Moema", found: true, snippet: "Casa da Pizza (Moema) — ótimas avaliações no Google, especialidade em massa fina." },
      { query: "pizzaria artesanal Moema", found: false, snippet: null },
    ],
    tip: null,
  },
  {
    id: "perplexity",
    name: "Perplexity",
    icon: "P",
    color: "#7C5CFC",
    found: true,
    lastCheck: "Há 2 horas",
    queries: [
      { query: "melhor pizzaria Moema SP", found: true, snippet: "#1 — Casa da Pizza, Moema. Rating 4.3/5 com 847 avaliações no Google Maps." },
      { query: "pizza artesanal São Paulo Moema", found: false, snippet: null },
      { query: "restaurante pizzaria Moema recomendação", found: true, snippet: "Casa da Pizza se destaca na região de Moema com forno a lenha e ingredientes italianos." },
    ],
    tip: null,
  },
  {
    id: "copilot",
    name: "Copilot (Bing)",
    icon: "B",
    color: "#0078D4",
    found: false,
    lastCheck: "Há 2 horas",
    queries: [
      { query: "melhor pizzaria Moema", found: false, snippet: null },
      { query: "pizza artesanal São Paulo sul", found: false, snippet: null },
      { query: "restaurante pizza Moema avaliações", found: false, snippet: null },
    ],
    tip: "Mantenha seu perfil do Google Business atualizado para melhorar presença no Bing.",
  },
  {
    id: "aioverviews",
    name: "AI Overviews",
    icon: "AI",
    color: "#1D9E75",
    found: false,
    lastCheck: "Há 2 horas",
    queries: [
      { query: "pizzaria Moema SP", found: false, snippet: null },
      { query: "melhor pizza São Paulo sul", found: false, snippet: null },
      { query: "pizza artesanal moema", found: false, snippet: null },
    ],
    tip: "AI Overviews do Google aparece para negócios com perfil completo e muitas avaliações positivas.",
  },
];

const HISTORY = [
  { date: "Mar 24", found: 2 },
  { date: "Mar 17", found: 2 },
  { date: "Mar 10", found: 1 },
  { date: "Mar 03", found: 1 },
  { date: "Feb 24", found: 0 },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeoPage() {
  const [selected, setSelected] = useState(PLATFORMS[0].id);
  const [refreshing, setRefreshing] = useState(false);

  const platform = PLATFORMS.find((p) => p.id === selected)!;
  const foundCount = PLATFORMS.filter((p) => p.found).length;

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise((r) => setTimeout(r, 2000));
    setRefreshing(false);
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
      <div className="max-w-[1000px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">
              Monitor GEO
            </h1>
            <p className="text-sm text-[#5a5f5c]">
              Presença nas IAs generativas — você aparece em{" "}
              <span className="text-[#1D9E75] font-semibold">{foundCount}</span> de{" "}
              {PLATFORMS.length} plataformas
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1f1c] border border-[#2a2f2c] text-sm text-[#9a9f9c] hover:text-[#FAFBFA] hover:border-[#3a3f3c] transition-all disabled:opacity-60 w-fit"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Verificando..." : "Verificar agora"}
          </button>
        </div>

        {/* Overall score */}
        <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-display font-bold text-[#1D9E75]"
                style={{ background: "rgba(29,158,117,0.1)" }}
              >
                {foundCount}/{PLATFORMS.length}
              </div>
              <div>
                <div className="text-lg font-semibold text-[#FAFBFA]">
                  Presença nas IAs
                </div>
                <div className="text-sm text-[#5a5f5c]">
                  {foundCount === 0
                    ? "Você ainda não aparece em nenhuma IA"
                    : foundCount < 3
                    ? "Presença parcial — há espaço para melhorar"
                    : "Boa presença nas IAs generativas"}
                </div>
              </div>
            </div>

            {/* History bars */}
            <div className="flex-1 flex items-end gap-2 justify-end">
              <span className="text-xs text-[#5a5f5c] mr-1">Histórico:</span>
              {HISTORY.map((h) => (
                <div key={h.date} className="flex flex-col items-center gap-1">
                  <div className="w-6 bg-[#2a2f2c] rounded-sm overflow-hidden" style={{ height: "40px" }}>
                    <div
                      className="w-full rounded-sm bg-[#1D9E75] transition-all"
                      style={{ height: `${(h.found / PLATFORMS.length) * 100}%`, marginTop: "auto" }}
                    />
                  </div>
                  <span className="text-[9px] text-[#5a5f5c]">{h.date.split(" ")[1]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-[#2a2f2c] mt-5 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1D9E75] transition-all duration-700"
              style={{ width: `${(foundCount / PLATFORMS.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Platform list */}
          <div className="flex flex-col gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                  selected === p.id
                    ? "border-[rgba(29,158,117,0.3)] bg-[rgba(29,158,117,0.08)]"
                    : "border-[#2a2f2c] bg-[#1a1f1c] hover:border-[#3a3f3c]"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                  style={{ background: p.color + "33", color: p.color }}
                >
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-[#FAFBFA] truncate">
                    {p.name}
                  </div>
                  <div className="text-[11px] text-[#5a5f5c] mt-0.5">
                    {p.lastCheck}
                  </div>
                </div>
                {p.found ? (
                  <CheckCircle2 className="w-4 h-4 text-[#1D9E75] flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-[#E24B4A] flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Platform detail */}
          <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                style={{ background: platform.color + "22", color: platform.color }}
              >
                {platform.icon}
              </div>
              <div>
                <h2 className="text-[15px] font-semibold text-[#FAFBFA]">
                  {platform.name}
                </h2>
                <span
                  className={`text-xs font-medium ${
                    platform.found ? "text-[#5DCAA5]" : "text-[#F09595]"
                  }`}
                >
                  {platform.found ? "✓ Você aparece nesta plataforma" : "✗ Não encontrado"}
                </span>
              </div>
            </div>

            {/* Queries */}
            <h3 className="text-xs font-semibold text-[#9a9f9c] uppercase tracking-wider mb-3">
              Consultas monitoradas
            </h3>
            <div className="flex flex-col gap-3 mb-5">
              {platform.queries.map((q, i) => (
                <div
                  key={i}
                  className={`p-3.5 rounded-xl border ${
                    q.found
                      ? "border-[rgba(29,158,117,0.2)] bg-[rgba(29,158,117,0.05)]"
                      : "border-[#2a2f2c] bg-[rgba(255,255,255,0.02)]"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {q.found ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1D9E75] flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#E24B4A] flex-shrink-0" />
                    )}
                    <span className="text-sm text-[#dadedd] font-medium">
                      &ldquo;{q.query}&rdquo;
                    </span>
                  </div>
                  {q.snippet ? (
                    <p className="text-xs text-[#9a9f9c] ml-5 leading-relaxed italic">
                      &ldquo;{q.snippet}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs text-[#5a5f5c] ml-5">
                      Negócio não mencionado nesta consulta
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Tip */}
            {platform.tip && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(239,159,39,0.05)] border border-[rgba(239,159,39,0.15)]">
                <AlertCircle className="w-4 h-4 text-[#EF9F27] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#FAFBFA] mb-0.5">
                    Como melhorar
                  </p>
                  <p className="text-xs text-[#9a9f9c] leading-relaxed">
                    {platform.tip}
                  </p>
                </div>
              </div>
            )}

            {platform.found && !platform.tip && (
              <div className="flex items-start gap-3 p-4 rounded-xl bg-[rgba(29,158,117,0.05)] border border-[rgba(29,158,117,0.15)]">
                <TrendingUp className="w-4 h-4 text-[#1D9E75] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-[#FAFBFA] mb-0.5">
                    Continue assim!
                  </p>
                  <p className="text-xs text-[#9a9f9c] leading-relaxed">
                    Seu negócio está sendo mencionado. Continue atualizando o
                    perfil e respondendo reviews para manter a visibilidade.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* GEO tip */}
        <div className="mt-6 p-4 bg-[rgba(29,158,117,0.05)] border border-[rgba(29,158,117,0.1)] rounded-xl">
          <div className="flex items-start gap-3">
            <Sparkles className="w-4 h-4 text-[#1D9E75] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[#FAFBFA]">
                O que é GEO e por que importa?
              </p>
              <p className="text-xs text-[#5a5f5c] mt-0.5 leading-relaxed">
                GEO (Generative Engine Optimization) é a prática de otimizar seu
                negócio para aparecer nas respostas de IAs como ChatGPT, Gemini e
                Perplexity. Cada vez mais, as pessoas perguntam a IAs
                &ldquo;qual o melhor restaurante perto de mim?&rdquo; — e quem
                aparece nas respostas ganha clientes sem pagar por anúncio.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
