"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type Business = {
  id: string;
  name: string;
  category: string;
  city: string;
  state: string;
};

type GeoCheck = {
  id: string;
  ai_platform: string;
  query: string;
  found: boolean;
  position?: number;
  snippet?: string;
  checked_at: string;
};

type PlatformData = {
  id: string;
  name: string;
  icon: string;
  color: string;
  found: boolean;
  lastCheck: string;
  queries: Array<{ query: string; found: boolean; snippet: string | null }>;
  tip: string | null;
};

const PLATFORM_INFO: Record<string, { name: string; icon: string; color: string; tip: string | null }> = {
  gemini: {
    name: "Google Gemini",
    icon: "G",
    color: "#4285F4",
    tip: "Adicione sua cidade e bairro na descrição do perfil para aparecer nas respostas do Gemini.",
  },
  chatgpt: {
    name: "ChatGPT",
    icon: "C",
    color: "#10A37F",
    tip: null,
  },
  perplexity: {
    name: "Perplexity",
    icon: "P",
    color: "#7C5CFC",
    tip: null,
  },
  copilot: {
    name: "Copilot (Bing)",
    icon: "B",
    color: "#0078D4",
    tip: "Mantenha seu perfil do Google Business atualizado para melhorar presença no Bing.",
  },
  aioverviews: {
    name: "AI Overviews",
    icon: "AI",
    color: "#1D9E75",
    tip: "AI Overviews do Google aparece para negócios com perfil completo e muitas avaliações positivas.",
  },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GeoPage() {
  const supabase = createClient();

  // State para dados reais
  const [geoChecks, setGeoChecks] = useState<GeoCheck[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [platforms, setPlatforms] = useState<PlatformData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>("gemini");
  const [refreshing, setRefreshing] = useState(false);

  // ✅ Carregar dados reais do Supabase
  useEffect(() => {
    async function loadData() {
      try {
        const user = await supabase.auth.getUser();
        if (!user.data.user) {
          setError("Usuário não autenticado");
          setLoading(false);
          return;
        }

        // Fetch businesses do usuário
        const { data: businesses, error: businessError } = (await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.data.user.id)
          .limit(1)) as { data: any[]; error: any };

        if (businessError || !businesses || businesses.length === 0) {
          setError("Nenhum negócio encontrado. Conecte um de seus negócios.");
          setLoading(false);
          return;
        }

        const currentBusiness = businesses[0];
        setBusiness(currentBusiness);

        // ✅ Fetch geo_checks REAIS deste negócio
        const { data: realChecks, error: checkError } = (await supabase
          .from("geo_checks")
          .select("*")
          .eq("business_id", currentBusiness.id)
          .order("checked_at", { ascending: false })) as { data: any[]; error: any };

        if (checkError) throw checkError;

        setGeoChecks(realChecks || []);

        // Agrupar por ai_platform e construir platforms array
        const grouped: Record<string, GeoCheck[]> = {};
        for (const check of realChecks || []) {
          if (!grouped[check.ai_platform]) {
            grouped[check.ai_platform] = [];
          }
          grouped[check.ai_platform].push(check);
        }

        const builtPlatforms: PlatformData[] = Object.entries(PLATFORM_INFO).map(
          ([platformId, info]) => {
            const checks = grouped[platformId] || [];
            const foundAny = checks.some((c) => c.found);
            const mostRecent = checks[0];

            return {
              id: platformId,
              ...info,
              found: foundAny,
              lastCheck: mostRecent
                ? formatTimeAgo(new Date(mostRecent.checked_at))
                : "Nunca verificado",
              queries: checks.map((c) => ({
                query: c.query,
                found: c.found,
                snippet: c.snippet || null,
              })),
            };
          }
        );

        setPlatforms(builtPlatforms);
        setSelected(builtPlatforms[0]?.id || "gemini");
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        setError(err instanceof Error ? err.message : "Erro ao carregar GEO data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Há ${diffMins} minuto${diffMins !== 1 ? "s" : ""}`;
    if (diffHours < 24) return `Há ${diffHours} hora${diffHours !== 1 ? "s" : ""}`;
    return `Há ${diffDays} dia${diffDays !== 1 ? "s" : ""}`;
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

  const platform = platforms.find((p) => p.id === selected);
  const foundCount = platforms.filter((p) => p.found).length;

  async function handleRefresh() {
    setRefreshing(true);
    try {
      // Chamar API para reexecutar verificações GEO
      const resp = await fetch("/api/geo/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessId: business?.id }),
      });
      if (!resp.ok) throw new Error("Erro ao verificar GEO");

      // Recarregar dados após verificação
      const updates = await resp.json();
      setGeoChecks(updates);

      // Reagrupar plataformas
      const grouped: Record<string, GeoCheck[]> = {};
      for (const check of updates) {
        if (!grouped[check.ai_platform]) {
          grouped[check.ai_platform] = [];
        }
        grouped[check.ai_platform].push(check);
      }

      const builtPlatforms: PlatformData[] = Object.entries(PLATFORM_INFO).map(
        ([platformId, info]) => {
          const checks = grouped[platformId] || [];
          const foundAny = checks.some((c) => c.found);

          return {
            id: platformId,
            ...info,
            found: foundAny,
            lastCheck: "Agora",
            queries: checks.map((c) => ({
              query: c.query,
              found: c.found,
              snippet: c.snippet || null,
            })),
          };
        }
      );

      setPlatforms(builtPlatforms);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao verificar");
    } finally {
      setRefreshing(false);
    }
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
              {platforms.length} plataformas
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
                {foundCount}/{platforms.length}
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

            {/* Placeholder for future history */}
            <div className="flex-1 flex items-center justify-end">
              <span className="text-xs text-[#5a5f5c]">Histórico em breve</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 rounded-full bg-[#2a2f2c] mt-5 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#1D9E75] transition-all duration-700"
              style={{ width: `${(foundCount / platforms.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-6">
          {/* Platform list */}
          <div className="flex flex-col gap-2">
            {platforms.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id)}
                className={`flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${selected === p.id
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
          {platform && (
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
                    className={`text-xs font-medium ${platform.found ? "text-[#5DCAA5]" : "text-[#F09595]"
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
                    className={`p-3.5 rounded-xl border ${q.found
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
          )}
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
