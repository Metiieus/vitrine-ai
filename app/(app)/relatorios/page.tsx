"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Star,
  Phone,
  Eye,
  Search,
  Navigation,
  MousePointerClick,
  FileDown,
  Globe,
} from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@/lib/supabase/client";

export default function RelatoriosPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const supabase = createClient();

      // Buscar usuário
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Buscar primeiro negócio do usuário
      const { data: businesses } = await supabase
        .from("businesses")
        .select("id")
        .eq("user_id", user.id)
        .limit(1);

      if (!businesses || businesses.length === 0) {
        setLoading(false);
        return;
      }

      const businessId = (businesses as any)[0].id;

      // Buscar auditoria
      const { data: audits } = await supabase
        .from("audits")
        .select("score, period_start")
        .eq("business_id", businessId)
        .order("created_at", { ascending: false })
        .limit(6);

      // Buscar insights
      const { data: insights } = await supabase
        .from("insights")
        .select("*")
        .eq("business_id", businessId)
        .order("period_end", { ascending: false })
        .limit(1)
        .single();

      // Buscar reviews para stats
      const { data: reviews } = await supabase
        .from("reviews")
        .select("rating")
        .eq("business_id", businessId);

      // Calcular stats
      const ratingByCount = reviews?.reduce(
        (acc: any, r: any) => {
          acc[r.rating] = (acc[r.rating] || 0) + 1;
          return acc;
        },
        {} as Record<number, number>
      ) || {};

      const avgRating =
        reviews && reviews.length > 0
          ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
          : 0;

      setData({
        scoreHistory: (audits || []).reverse(),
        insights: insights || {
          searches: 0,
          views: 0,
          calls: 0,
          direction_requests: 0,
          website_clicks: 0,
        },
        reviewStats: {
          total: reviews?.length || 0,
          avg: avgRating,
          byRating: [5, 4, 3, 2, 1].map((s) => ({
            stars: s,
            count: ratingByCount[s] || 0,
            pct:
              reviews && reviews.length > 0
                ? Math.round(((ratingByCount[s] || 0) / reviews.length) * 100)
                : 0,
          })),
        },
      });
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] flex items-center justify-center">
        <p>Carregando relatórios...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] flex items-center justify-center">
        <p>Ainda não há dados para exibir</p>
      </div>
    );
  }

  const { scoreHistory, insights, reviewStats } = data;
  const maxScore = scoreHistory.length > 0 ? Math.max(...scoreHistory.map((h: any) => h.score || 0)) : 0;
  const scoreGain =
    scoreHistory.length > 1
      ? scoreHistory[scoreHistory.length - 1].score - scoreHistory[0].score
      : 0;

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
      <div className="max-w-[1000px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">
              Relatórios
            </h1>
            <p className="text-sm text-[#5a5f5c]">
              Evolução dos últimos 6 meses
            </p>
          </div>
          <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1D9E75] text-white text-sm font-semibold hover:bg-[#3DB88E] transition-colors w-fit">
            <FileDown className="w-4 h-4" />
            Exportar PDF
          </button>
        </div>

        {/* Score evolution */}
        <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-[15px] font-semibold text-[#FAFBFA]">
                Evolução do Score
              </h2>
              <p className="text-sm text-[#5a5f5c] mt-0.5">
                +{scoreGain} pontos em 6 meses
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-sm font-semibold text-[#5DCAA5]">
              <TrendingUp className="w-4 h-4" />
              +{scoreGain}pts
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex items-end gap-3 h-32">
            {scoreHistory.map((h: any, i: number) => {
              const isLast = i === scoreHistory.length - 1;
              const height = `${(h.score / (maxScore + 10)) * 100}%`;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <span className="text-xs font-semibold" style={{ color: isLast ? "#5DCAA5" : "#9a9f9c" }}>
                    {h.score}
                  </span>
                  <div className="w-full relative" style={{ height: "80px" }}>
                    <div
                      className="absolute bottom-0 w-full rounded-t-lg transition-all duration-700"
                      style={{
                        height,
                        background: isLast
                          ? "linear-gradient(to top, #0F6E56, #5DCAA5)"
                          : "#2a2f2c",
                      }}
                    />
                  </div>
                  <span className="text-xs text-[#5a5f5c]">
                    {new Date(h.period_start).toLocaleDateString('pt-BR', { month: 'short' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Insights */}
        <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6 mb-6">
          <h2 className="text-[15px] font-semibold text-[#FAFBFA] mb-5">
            Métricas do Google Business — últimos 30 dias
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Search, label: "Buscas diretas", value: insights?.searches || 0 },
              { icon: Eye, label: "Visualizações", value: insights?.views || 0 },
              { icon: Phone, label: "Ligações", value: insights?.calls || 0 },
              { icon: Navigation, label: "Rotas solicitadas", value: insights?.direction_requests || 0 },
              { icon: MousePointerClick, label: "Cliques no site", value: insights?.website_clicks || 0 },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="bg-[#0d1210] border border-[#2a2f2c] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(29,158,117,0.1)] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#1D9E75]" />
                    </div>
                  </div>
                  <div className="text-2xl font-display font-bold text-[#FAFBFA]">
                    {item.value.toLocaleString("pt-BR")}
                  </div>
                  <div className="text-xs text-[#5a5f5c] mt-0.5">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Reviews analysis */}
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6">
            <h2 className="text-[15px] font-semibold text-[#FAFBFA] mb-5">
              Análise de avaliações
            </h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="text-center">
                <div className="text-4xl font-display font-bold text-[#EF9F27]">
                  {reviewStats.avg}
                </div>
                <div className="flex justify-center mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(parseFloat(reviewStats.avg))
                          ? "fill-[#EF9F27] text-[#EF9F27]"
                          : "text-[#2a2f2c]"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-[#5a5f5c] mt-1">
                  {reviewStats.total.toLocaleString("pt-BR")} avaliações
                </div>
              </div>
              <div className="flex-1">
                {reviewStats.byRating.map((r: any) => (
                  <div key={r.stars} className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs text-[#5a5f5c] w-3">{r.stars}</span>
                    <Star className="w-3 h-3 fill-[#EF9F27] text-[#EF9F27]" />
                    <div className="flex-1 h-1.5 rounded-full bg-[#2a2f2c] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#EF9F27]"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-[#5a5f5c] w-8 text-right">
                      {r.pct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[rgba(29,158,117,0.05)] border border-[rgba(29,158,117,0.1)]">
              <div>
                <div className="text-xl font-display font-bold text-[#1D9E75]">
                  {reviewStats.total > 0 ? Math.round((reviewStats.byRating.reduce((sum: number, r: any) => sum + r.count, 0) / reviewStats.total) * 100) : 0}%
                </div>
                <div className="text-xs text-[#5a5f5c]">Taxa de resposta</div>
              </div>
              <div className="w-px h-8 bg-[#2a2f2c]" />
              <div>
                <div className="text-xl font-display font-bold text-[#FAFBFA]">
                  {reviewStats.total.toLocaleString("pt-BR")}
                </div>
                <div className="text-xs text-[#5a5f5c]">Total de reviews</div>
              </div>
            </div>
          </div>

          {/* GEO summary */}
          <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-6">
            <h2 className="text-[15px] font-semibold text-[#FAFBFA] mb-5">
              Presença nas IAs — GEO
            </h2>
            {[
              { name: "ChatGPT", found: true },
              { name: "Perplexity", found: true },
              { name: "Google Gemini", found: false },
              { name: "Copilot (Bing)", found: false },
              { name: "AI Overviews", found: false },
            ].map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between py-2.5 border-b border-[#1e2320] last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#5a5f5c]" />
                  <span className="text-sm text-[#dadedd]">{p.name}</span>
                </div>
                {p.found ? (
                  <span className="flex items-center gap-1 text-xs text-[#5DCAA5]">
                    <TrendingUp className="w-3 h-3" /> Aparece
                  </span>
                ) : (
                  <span className="text-xs text-[#E24B4A]">Não encontrado</span>
                )}
              </div>
            ))}
            <div className="mt-4 text-center">
              <div className="text-2xl font-display font-bold text-[#1D9E75]">2/5</div>
              <div className="text-xs text-[#5a5f5c]">plataformas com presença</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
