"use client";

import { useState, useEffect } from "react";
import { redirect } from "next/navigation";
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
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type Review = {
  id: string;
  author_name: string;
  rating: number;
  text: string;
  created_at: string;
  response_status: "draft" | "published" | "archived";
  ai_response: string | null;
  business_id: string;
};

type Business = {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [filter, setFilter] = useState<"all" | "pending" | "responded">("all");
  const [generating, setGenerating] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // ✅ NOVO: Carregar dados reais do Supabase
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);

      // Buscar usuário
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        redirect("/login");
      }

      // Buscar primeiro negócio do usuário
      const { data: businesses, error: businessError } = await supabase
        .from("businesses")
        .select("*")
        .eq("user_id", user.id)
        .limit(1);

      if (businessError || !businesses || businesses.length === 0) {
        setError("Nenhum negócio encontrado. Conecte um de seus negócios.");
        setLoading(false);
        return;
      }

      const currentBusiness = businesses[0] as Business;
      setBusiness(currentBusiness);

      // ✅ Buscar reviews REAIS deste negócio
      const { data: realReviews, error: reviewError } = await supabase
        .from("reviews")
        .select("*")
        .eq("business_id", currentBusiness.id)
        .order("created_at", { ascending: false });

      if (reviewError) throw reviewError;

      setReviews(realReviews || []);
      setError(null);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
      setError(
        err instanceof Error ? err.message : "Erro ao carregar reviews"
      );
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#1D9E75]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  const filtered = reviews.filter(
    (r) => filter === "all" || r.response_status === (filter === "pending" ? "draft" : "published")
  );
  const pendingCount = reviews.filter(
    (r) => !r.ai_response || r.response_status === "draft"
  ).length;

  async function generateResponse(id: string) {
    const review = reviews.find((r) => r.id === id);
    if (!review || !business) return;

    setGenerating(id);
    try {
      // ✅ USAR dados reais do business ao invés de MOCK_BUSINESS
      const resp = await fetch("/api/ai/review-response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: review.author_name,
          rating: review.rating,
          text: review.text,
          businessName: business.name,
          category: business.category,
          city: business.city,
          state: business.state,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) throw new Error(data.error ?? "Erro ao gerar resposta");

      // Salvar resposta no banco de dados
      const { error: updateError } = await supabase
        .from("reviews")
        .update({
          ai_response: data.response,
          response_status: "draft",
          updated_at: new Date().toISOString(),
        } as never)
        .eq("id", id);

      if (updateError) throw updateError;

      // Atualizar estado local
      setReviews((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, ai_response: data.response, response_status: "draft" }
            : r
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

  async function markResponded(id: string) {
    // Salvar no banco que a resposta foi publicada
    const { error } = await supabase
      .from("reviews")
      .update({
        response_status: "published",
        updated_at: new Date().toISOString(),
      } as never)
      .eq("id", id);

    if (error) {
      alert("Erro ao salvar resposta");
      return;
    }

    setReviews((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, response_status: "published" } : r
      )
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
                className={`px-3 py-1.5 rounded-lg transition-colors ${filter === f
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
              <div className="flex flex-col min-[440px]:flex-row items-start min-[440px]:justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0F6E56] to-[#5DCAA5] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
                    {review.author_name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#FAFBFA] truncate">
                      {review.author_name}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < review.rating
                              ? "fill-[#EF9F27] text-[#EF9F27]"
                              : "text-[#2a2f2c]"
                              }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-[#5a5f5c]">
                        {new Date(review.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-1 rounded-full uppercase tracking-wider flex-shrink-0 ${review.response_status === "published"
                    ? "bg-[rgba(29,158,117,0.1)] text-[#5DCAA5]"
                    : "bg-[rgba(239,159,39,0.1)] text-[#EF9F27]"
                    }`}
                >
                  {review.response_status === "published" ? (
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
              {review.ai_response ? (
                <div className="bg-[rgba(29,158,117,0.05)] border border-[rgba(29,158,117,0.15)] rounded-xl p-4 mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#1D9E75]" />
                    <span className="text-xs font-semibold text-[#1D9E75]">
                      Resposta gerada pela IA
                    </span>
                  </div>
                  <p className="text-sm text-[#dadedd] leading-relaxed">
                    {review.ai_response}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => copyResponse(review.id, review.ai_response!)}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[#2a2f2c] text-[#9a9f9c] hover:text-[#FAFBFA] transition-colors"
                    >
                      {copied === review.id ? (
                        <Check className="w-3 h-3 text-[#1D9E75]" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      {copied === review.id ? "Copiado!" : "Copiar"}
                    </button>
                    {review.response_status === "draft" && (
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
              ) : review.response_status === "draft" ? (
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
