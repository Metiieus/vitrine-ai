import {
  Camera,
  Info,
  Star,
  FileText,
  Globe,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { ScoreGauge } from "@/components/dashboard/ScoreGauge";

export const metadata = { title: "Auditoria" };

// ─── Mock data ────────────────────────────────────────────────────────────────

const AUDIT_CATEGORIES = [
  {
    id: "photos",
    label: "Fotos e Mídia",
    icon: Camera,
    score: 21,
    max: 25,
    color: "#5DCAA5",
    items: [
      { text: "Logo do negócio adicionado", done: true },
      { text: "Foto de capa configurada", done: true },
      { text: "5 ou mais fotos do ambiente", done: true },
      { text: "3 ou mais fotos de produtos/serviços", done: false, tip: "Adicione fotos do cardápio ou dos seus produtos" },
      { text: "Fotos atualizadas nos últimos 90 dias", done: false, tip: "A última foto foi adicionada há 47 dias" },
    ],
  },
  {
    id: "info",
    label: "Informações e Categorias",
    icon: Info,
    score: 22,
    max: 25,
    color: "#1D9E75",
    items: [
      { text: "Descrição com 150+ caracteres", done: true },
      { text: "Categoria principal correta", done: true },
      { text: "2 ou mais categorias secundárias", done: true },
      { text: "Horários preenchidos (todos os dias)", done: true },
      { text: "Horários especiais/feriados configurados", done: false, tip: "Configure os horários do Carnaval e Semana Santa" },
      { text: "Atributos preenchidos (Wi-Fi, estacionamento...)", done: true },
      { text: "Website e telefone cadastrados", done: true },
    ],
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    score: 12,
    max: 20,
    color: "#EF9F27",
    items: [
      { text: "50 ou mais avaliações no Google", done: true },
      { text: "Nota média 4.0 ou superior", done: true },
      { text: "80%+ das reviews respondidas", done: false, tip: "Você tem 23 reviews sem resposta — use a IA para responder rápido" },
      { text: "Tempo médio de resposta menor que 48h", done: false, tip: "Média atual: 6 dias. Responda mais rápido para melhorar o score" },
    ],
  },
  {
    id: "posts",
    label: "Google Posts",
    icon: FileText,
    score: 7,
    max: 15,
    color: "#EF9F27",
    items: [
      { text: "Possui pelo menos 1 post publicado", done: true },
      { text: "Post publicado nos últimos 7 dias", done: false, tip: "Último post há 11 dias — use o gerador de posts para publicar hoje" },
      { text: "4 ou mais posts no último mês", done: false, tip: "Apenas 1 post este mês. Meta: 4 posts/mês" },
      { text: "Posts com imagem", done: true },
      { text: "Posts com chamada para ação (CTA)", done: false, tip: "Adicione um CTA como 'Visite-nos' ou 'Agende agora'" },
    ],
  },
  {
    id: "geo",
    label: "Visibilidade em IAs — GEO",
    icon: Globe,
    score: 9,
    max: 15,
    color: "#EF9F27",
    items: [
      { text: "Aparece nas respostas do Gemini", done: false, tip: "Adicione sua cidade e bairro na descrição para melhorar a visibilidade" },
      { text: "Aparece nas respostas do ChatGPT", done: true },
      { text: "Mencionado em 3 ou mais IAs", done: false, tip: "Você aparece em 2 de 5 plataformas monitoradas" },
    ],
  },
];

const TOTAL_SCORE = AUDIT_CATEGORIES.reduce((s, c) => s + c.score, 0);

// ─── Sub-components ───────────────────────────────────────────────────────────

function CategoryCard({
  category,
}: {
  category: (typeof AUDIT_CATEGORIES)[0];
}) {
  const Icon = category.icon;
  const pct = Math.round((category.score / category.max) * 100);
  const done = category.items.filter((i) => i.done).length;

  return (
    <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `${category.color}18` }}
          >
            <Icon className="w-4 h-4" style={{ color: category.color }} />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold text-[#FAFBFA]">
              {category.label}
            </h3>
            <p className="text-xs text-[#5a5f5c]">
              {done} de {category.items.length} itens completos
            </p>
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-2xl font-display font-bold"
            style={{ color: category.color }}
          >
            {category.score}
            <span className="text-sm font-normal text-[#5a5f5c]">
              /{category.max}
            </span>
          </div>
          <div className="text-xs text-[#5a5f5c]">{pct}%</div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-[#2a2f2c] mb-5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: category.color }}
        />
      </div>

      {/* Items */}
      <div className="flex flex-col gap-2">
        {category.items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            {item.done ? (
              <CheckCircle2 className="w-4 h-4 text-[#1D9E75] flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-4 h-4 text-[#E24B4A] flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm leading-snug ${
                  item.done ? "text-[#9a9f9c]" : "text-[#dadedd]"
                }`}
              >
                {item.text}
              </p>
              {!item.done && item.tip && (
                <p className="text-xs text-[#5a5f5c] mt-0.5 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5 text-[#EF9F27]" />
                  {item.tip}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AuditoriaPage() {
  const pending = AUDIT_CATEGORIES.flatMap((c) =>
    c.items.filter((i) => !i.done)
  ).length;

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
      <div className="max-w-[1100px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-2 rounded-xl bg-[#1a1f1c] border border-[#2a2f2c] text-[#9a9f9c] hover:text-[#FAFBFA] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">
                Auditoria completa
              </h1>
              <p className="text-sm text-[#5a5f5c]">
                {pending} melhorias identificadas
              </p>
            </div>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1f1c] border border-[#2a2f2c] text-sm text-[#9a9f9c] hover:text-[#FAFBFA] hover:border-[#3a3f3c] transition-all w-fit">
            <RefreshCw className="w-4 h-4" />
            Nova auditoria
          </button>
        </div>

        {/* Score geral */}
        <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-center gap-6">
          <ScoreGauge score={TOTAL_SCORE} size={160} />
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[#FAFBFA] mb-1">
              Score de saúde do perfil
            </h2>
            <p className="text-sm text-[#5a5f5c] mb-4">
              Baseado em 5 dimensões. Corrija os itens abaixo para aumentar seu
              score e aparecer mais no Google e nas IAs.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {AUDIT_CATEGORIES.map((c) => {
                const pct = Math.round((c.score / c.max) * 100);
                return (
                  <div key={c.id} className="flex flex-col items-center gap-1">
                    <div className="w-full h-1.5 rounded-full bg-[#2a2f2c] overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: c.color }}
                      />
                    </div>
                    <span className="text-[10px] text-[#5a5f5c] text-center leading-tight">
                      {c.label.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Categories grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {AUDIT_CATEGORIES.map((cat) => (
            <CategoryCard key={cat.id} category={cat} />
          ))}
        </div>
      </div>
    </div>
  );
}
