"use client";

import { useState } from "react";
import {
  Star,
  Sparkles,
  CheckCircle2,
  Clock,
  Filter,
  Loader2,
  Copy,
  Check,
  Send,
} from "lucide-react";

// ─── Mock data ────────────────────────────────────────────────────────────────

type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  date: string;
  status: "pending" | "responded";
  aiResponse: string | null;
};

const MOCK_REVIEWS: Review[] = [
  {
    id: "1",
    author: "Maria Silva",
    rating: 5,
    text: "Melhor pizza da região! Massa crocante, recheio generoso e atendimento nota 10. Já virei cliente fiel. Recomendo muito!",
    date: "2 dias atrás",
    status: "pending",
    aiResponse: null,
  },
  {
    id: "2",
    author: "João Pereira",
    rating: 2,
    text: "Esperei mais de 1 hora pelo pedido e chegou frio. Muito decepcionante para um sábado à noite.",
    date: "3 dias atrás",
    status: "pending",
    aiResponse: null,
  },
  {
    id: "3",
    author: "Ana Costa",
    rating: 4,
    text: "Boa pizza, ambiente agradável. O único ponto negativo foi a demora para pagar. Mas voltaria sim.",
    date: "5 dias atrás",
    status: "pending",
    aiResponse: null,
  },
  {
    id: "4",
    author: "Carlos Mendes",
    rating: 5,
    text: "Excelente! Pizza deliciosa, chegou quente e no prazo. Entregador super simpático.",
    date: "1 semana atrás",
    status: "responded",
    aiResponse:
      "Que ótimo ouvir isso, Carlos! Ficamos muito felizes que a pizza chegou no ponto certo e que você foi bem atendido. Sua satisfação é o que nos motiva todo dia. Até a próxima! 🍕",
  },
  {
    id: "5",
    author: "Fernanda Lima",
    rating: 3,
    text: "Pizza ok, nada demais. Esperava mais pelo preço.",
    date: "1 semana atrás",
    status: "pending",
    aiResponse: null,
  },
  {
    id: "6",
    author: "Roberto Alves",
    rating: 5,
    text: "Fiz aniversário aqui e foi incrível! Atendimento personalizado, decoração, tudo perfeito.",
    date: "2 semanas atrás",
    status: "responded",
    aiResponse:
      "Roberto, que honra ter celebrado seu aniversário com a gente! Foi um prazer especial cuidar de cada detalhe para tornar seu dia ainda mais especial. Esperamos que tenha sido uma noite inesquecível. Volte sempre! 🎉",
  },
];

// Dados do negócio mock — será substituído pelo negócio real do usuário
const MOCK_BUSINESS = {
  name: "Casa da Pizza",
  category: "Restaurante",
  city: "São Paulo",
  state: "SP",
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const [reviews, setReviews] = useState(MOCK_REVIEWS);
  const [filter, setFilter] = useState<"all" | "pending" | "responded">("all");
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = reviews.filter(
    (r) => filter === "all" || r.status === filter
  );
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  async function generateResponse(id: string) {
    const review = reviews.find((r) => r.id === id);
    if (!review) return;

    setGenerating(id);
    try {
      const resp = await fetch("/api/ai/review-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: review.author,
          rating: review.rating,
          text: review.text,
          businessName: MOCK_BUSINESS.name,
          category: MOCK_BUSINESS.category,
          city: MOCK_BUSINESS.city,
          state: MOCK_BUSINESS.state,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error ?? "Erro ao gerar resposta");

      setReviews((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, aiResponse: data.response } : r
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao gerar resposta");
    } finally {
      setGenerating(null);
    }
  }

  async function copyResponse(id: string, text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  function markResponded(id: string) {
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "responded" } : r))
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
      <div className="max-w-[900px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">
              Reviews
            </h1>
            <p className="text-sm text-[#5a5f5c]">
              {pendingCount} avaliações aguardando resposta
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#5a5f5c] flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filtro:
            </span>
            {(["all", "pending", "responded"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filter === f
                    ? "bg-[#1D9E75] text-white font-medium"
                    : "bg-[#1a1f1c] border border-[#2a2f2c] text-[#9a9f9c] hover:text-[#FAFBFA]"
                }`}
              >
                {f === "all" ? "Todos" : f === "pending" ? "Pendentes" : "Respondidos"}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total de reviews", value: reviews.length, color: "#9a9f9c" },
            { label: "Pendentes", value: pendingCount, color: "#EF9F27" },
            { label: "Respondidas", value: reviews.length - pendingCount, color: "#1D9E75" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-xl p-4 text-center"
            >
              <div
                className="text-2xl font-display font-bold"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
              <div className="text-xs text-[#5a5f5c] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Reviews list */}
        <div className="flex flex-col gap-4">
          {filtered.map((review) => (
            <div
              key={review.id}
              className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5"
            >
              {/* Review header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F6E56] to-[#5DCAA5] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {review.author[0]}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-[#FAFBFA]">
                      {review.author}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < review.rating
                                ? "fill-[#EF9F27] text-[#EF9F27]"
                                : "text-[#2a2f2c]"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#5a5f5c]">{review.date}</span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${
                    review.status === "responded"
                      ? "bg-[rgba(29,158,117,0.1)] text-[#5DCAA5]"
                      : "bg-[rgba(239,159,39,0.1)] text-[#EF9F27]"
                  }`}
                >
                  {review.status === "responded" ? (
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Respondida
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Pendente
                    </span>
                  )}
                </span>
              </div>

              {/* Review text */}
              <p className="text-sm text-[#9a9f9c] leading-relaxed mb-4">
                &ldquo;{review.text}&rdquo;
              </p>

              {/* AI Response */}
              {review.aiResponse ? (
                <div className="bg-[rgba(29,158,117,0.05)] border border-[rgba(29,158,117,0.15)] rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#1D9E75]" />
                    <span className="text-xs font-semibold text-[#1D9E75]">
                      Resposta gerada pela IA
                    </span>
                  </div>
                  <p className="text-sm text-[#dadedd] leading-relaxed">
                    {review.aiResponse}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => copyResponse(review.id, review.aiResponse!)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#2a2f2c] text-[#9a9f9c] hover:text-[#FAFBFA] transition-colors"
                    >
                      {copied === review.id ? (
                        <Check className="w-3 h-3 text-[#1D9E75]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied === review.id ? "Copiado!" : "Copiar"}
                    </button>
                    {review.status === "pending" && (
                      <button
                        onClick={() => markResponded(review.id)}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#1D9E75] text-white hover:bg-[#3DB88E] transition-colors"
                      >
                        <Send className="w-3 h-3" />
                        Marcar como respondida
                      </button>
                    )}
                  </div>
                </div>
              ) : review.status === "pending" ? (
                <button
                  onClick={() => generateResponse(review.id)}
                  disabled={generating === review.id}
                  className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-[rgba(29,158,117,0.08)] border border-[rgba(29,158,117,0.2)] text-[#1D9E75] hover:bg-[rgba(29,158,117,0.15)] transition-colors disabled:opacity-60"
                >
                  {generating === review.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {generating === review.id ? "Gerando resposta..." : "Gerar resposta com IA"}
                </button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
