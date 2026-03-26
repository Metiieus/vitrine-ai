"use client";

import { useState, useEffect } from "react";
import { MapPin, TrendingUp, TrendingDown, RefreshCw, Info, ChevronDown, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  KEYWORDS,
  COL_LABELS,
  ROW_LABELS,
  fetchGridFromDB,
  gridStats,
  rankColor,
  type GridCell,
} from "@/lib/geo/radar-local";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RadarLocalPage() {
  const router = useRouter();
  const supabase = createClient();
  const [keyword, setKeyword] = useState(KEYWORDS[0]);
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [loading, setLoading] = useState(false);
  const [showKeywordMenu, setShowKeywordMenu] = useState(false);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [isAgency, setIsAgency] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(true);

  // Load user plan from Supabase
  useEffect(() => {
    async function checkPlan() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("plan")
          .eq("id", user.id)
          .single();

        setIsAgency((profile as any)?.plan === "agency");
      } catch (error) {
        console.error("Erro ao verificar plano:", error);
      } finally {
        setLoadingPlan(false);
      }
    }

    checkPlan();
  }, []);

  // Load grid data from Supabase
  useEffect(() => {
    async function loadGrid() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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

        // Carregar grid de rankings do banco de dados
        setLoading(true);
        const geoGrid = await fetchGridFromDB(businessId, keyword);
        setGrid(geoGrid);
      } catch (error) {
        console.error("Erro ao carregar grid:", error);
      } finally {
        setLoading(false);
      }
    }

    if (isAgency) {
      loadGrid();
    }
  }, [keyword, isAgency]);

  const stats = grid.length > 0 ? gridStats(grid) : null;

  if (loadingPlan) {
    return (
      <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center">
        <div className="text-[#5a5f5c] flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          Carregando...
        </div>
      </div>
    );
  }

  if (!isAgency) {
    return <RadarLocalLocked />;
  }

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
      <div className="max-w-[1100px] mx-auto px-5 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-display text-2xl font-bold text-[#FAFBFA]">RadarLocal</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(239,159,39,0.15)] text-[#EF9F27] uppercase tracking-wider">
                Agência
              </span>
            </div>
            <p className="text-sm text-[#5a5f5c]">
              Heat map de ranking — onde você aparece no Google Maps por bairro
            </p>
          </div>
          <button
            onClick={async () => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: businesses } = await supabase
                  .from("businesses")
                  .select("id")
                  .eq("user_id", user.id)
                  .limit(1);

                if (!businesses || businesses.length === 0) return;

                setLoading(true);
                const geoGrid = await fetchGridFromDB((businesses as any)[0].id, keyword);
                setGrid(geoGrid);
              } catch (error) {
                console.error("Erro ao atualizar grid:", error);
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1f1c] border border-[#2a2f2c] text-sm text-[#9a9f9c] hover:text-[#FAFBFA] transition-all disabled:opacity-60 w-fit"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {/* Keyword selector */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm text-[#5a5f5c]">Palavra-chave:</span>
          <div className="relative">
            <button
              onClick={() => setShowKeywordMenu(!showKeywordMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#1a1f1c] border border-[rgba(29,158,117,0.3)] text-sm text-[#FAFBFA] hover:border-[#1D9E75] transition-colors"
            >
              <span className="text-[#1D9E75]">&#9679;</span>
              {keyword}
              <ChevronDown className="w-3.5 h-3.5 text-[#5a5f5c]" />
            </button>
            {showKeywordMenu && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-[#1a1f1c] border border-[#2a2f2c] rounded-xl overflow-hidden shadow-2xl min-w-[240px]">
                {KEYWORDS.map((kw) => (
                  <button key={kw} onClick={() => { setKeyword(kw); setShowKeywordMenu(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${kw === keyword ? "text-[#1D9E75] bg-[rgba(29,158,117,0.08)]" : "text-[#9a9f9c] hover:text-[#FAFBFA] hover:bg-[rgba(255,255,255,0.03)]"}`}>
                    {kw}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats row */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { label: "Posição média", value: `#${stats.avg}`, color: "#FAFBFA", desc: "na região" },
              { label: "Top 3 (ótimo)", value: stats.top3, color: "#5DCAA5", desc: `de ${stats.total} pontos` },
              { label: "Top 10", value: stats.top10, color: "#1D9E75", desc: `de ${stats.total} pontos` },
              { label: "Fora do top 15", value: stats.out20, color: "#E24B4A", desc: "pontos críticos" },
            ].map((s) => (
              <div key={s.label} className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-xl p-4">
                <div className="text-2xl font-display font-bold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-xs font-medium text-[#dadedd] mt-0.5">{s.label}</div>
                <div className="text-[11px] text-[#5a5f5c]">{s.desc}</div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5 overflow-x-auto">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-[#1D9E75]" />
            <h2 className="text-[14px] font-semibold text-[#FAFBFA]">
              Mapa de posicionamento — São Paulo · Zona Sul
            </h2>
            <div className="ml-auto flex items-center gap-1 text-xs text-[#5a5f5c]">
              <Info className="w-3 h-3" />
              Passe o mouse sobre um ponto para ver detalhes
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64 text-[#5a5f5c] text-sm gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Verificando posição em 49 pontos geográficos...
            </div>
          ) : grid.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-[#5a5f5c] text-sm">
              Nenhum dado de ranking disponível. Tente novamente em breve.
            </div>
          ) : (
            <div className="min-w-[560px]">
              <div className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
                <div />
                {COL_LABELS.map((l) => (
                  <div key={l} className="text-[9px] text-[#5a5f5c] text-center truncate px-1">{l}</div>
                ))}
              </div>

              {grid.map((row, ri) => (
                <div key={ri} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: "80px repeat(7, 1fr)" }}>
                  <div className="flex items-center justify-end pr-2 text-[9px] text-[#5a5f5c] text-right">
                    {ROW_LABELS[ri]}
                  </div>
                  {row.map((cell, ci) => {
                    const isCenter = ri === 3 && ci === 3;
                    const isHovered = hoveredCell?.row === ri && hoveredCell?.col === ci;
                    const c = rankColor(cell.rank);
                    return (
                      <div
                        key={ci}
                        onMouseEnter={() => setHoveredCell({ row: ri, col: ci })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className="relative aspect-square rounded-lg flex items-center justify-center cursor-default transition-all duration-150"
                        style={{
                          background: c.bg,
                          border: `1.5px solid ${isCenter ? "#1D9E75" : isHovered ? c.text : c.border}`,
                          transform: isHovered || isCenter ? "scale(1.1)" : "scale(1)",
                          zIndex: isHovered || isCenter ? 10 : 1,
                          boxShadow: isCenter ? `0 0 12px rgba(29,158,117,0.4)` : isHovered ? `0 0 8px ${c.text}44` : "none",
                        }}
                      >
                        {isCenter && (
                          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rounded-full bg-[#1D9E75] border border-[#0A0F0D]" />
                        )}
                        <span className="text-[11px] font-bold" style={{ color: c.text }}>
                          {cell.rank !== null ? `#${cell.rank}` : "–"}
                        </span>
                        {isHovered && (
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-50 bg-[#0d1210] border border-[#2a2f2c] rounded-lg px-3 py-2 shadow-xl whitespace-nowrap pointer-events-none">
                            <div className="text-xs font-semibold text-[#FAFBFA]">{COL_LABELS[ci]}</div>
                            <div className="text-[11px] text-[#5a5f5c]">{ROW_LABELS[ri]}</div>
                            <div className="text-xs mt-1" style={{ color: c.text }}>
                              {cell.rank !== null ? `Posição #${cell.rank}` : "Sem dados"}
                              {isCenter && " (seu negócio)"}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-5 pt-4 border-t border-[#2a2f2c] flex-wrap">
            <span className="text-[11px] text-[#5a5f5c]">Legenda:</span>
            {[
              { label: "#1–3 (Ótimo)", color: "#5DCAA5" },
              { label: "#4–7 (Bom)", color: "#1D9E75" },
              { label: "#8–10 (Regular)", color: "#EF9F27" },
              { label: "#11–15 (Ruim)", color: "#F09595" },
              { label: "#16+ (Crítico)", color: "#E24B4A" },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5 text-[11px]">
                <div className="w-3 h-3 rounded-sm" style={{ background: l.color + "44", border: `1px solid ${l.color}` }} />
                <span style={{ color: l.color }}>{l.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 text-[11px] ml-2">
              <div className="w-3 h-3 rounded-full bg-[#1D9E75]" />
              <span className="text-[#5a5f5c]">Seu negócio</span>
            </div>
          </div>
        </div>

        {/* Insight */}
        {stats && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-[rgba(29,158,117,0.05)] border border-[rgba(29,158,117,0.1)] rounded-xl">
            {parseFloat(stats.avg) <= 7 ? (
              <TrendingUp className="w-4 h-4 text-[#1D9E75] flex-shrink-0 mt-0.5" />
            ) : (
              <TrendingDown className="w-4 h-4 text-[#EF9F27] flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="text-sm font-medium text-[#FAFBFA]">
                Posição média {stats.avg} para &ldquo;{keyword}&rdquo;
              </p>
              <p className="text-xs text-[#5a5f5c] mt-0.5">
                Você aparece no top 3 em <strong className="text-[#5DCAA5]">{stats.top3} pontos</strong> da região
                e fora do top 15 em <strong className="text-[#E24B4A]">{stats.out20} pontos</strong>.
                {stats.out20 > 10 && " Responda mais reviews e publique posts semanais para melhorar."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Locked state ─────────────────────────────────────────────────────────────

function RadarLocalLocked() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] flex items-center justify-center px-5">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(239,159,39,0.07) 0%, transparent 70%)" }}
      />
      <div className="relative z-10 max-w-lg w-full text-center">
        <div className="w-20 h-20 rounded-2xl bg-[rgba(239,159,39,0.1)] border border-[rgba(239,159,39,0.2)] flex items-center justify-center mx-auto mb-6">
          <MapPin className="w-9 h-9 text-[#EF9F27]" />
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(239,159,39,0.1)] border border-[rgba(239,159,39,0.2)] text-[#EF9F27] text-xs font-bold uppercase tracking-wider mb-4">
          <Lock className="w-3 h-3" />
          Exclusivo Plano Agência
        </div>

        <h1 className="font-display text-3xl font-bold text-[#FAFBFA] mb-3">RadarLocal</h1>
        <p className="text-[#9a9f9c] mb-8 leading-relaxed">
          Veja exatamente em qual posição você aparece no Google Maps em 49 pontos geográficos da sua cidade.
          Identifique bairros onde você está fraco e aja antes da concorrência.
        </p>

        {/* Preview grid (blurred) */}
        <div className="relative mb-8 overflow-hidden rounded-2xl border border-[#2a2f2c]">
          <div className="absolute inset-0 z-10 backdrop-blur-sm bg-[rgba(10,15,13,0.5)]" />
          <div className="p-4 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 49 }).map((_, i) => {
              const rank = Math.floor(Math.random() * 18) + 1;
              const c = rankColor(rank);
              return (
                <div key={i} className="aspect-square rounded flex items-center justify-center text-[10px] font-bold"
                  style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
                  #{rank}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link href="/configuracoes"
            className="px-6 py-3 rounded-xl bg-[#EF9F27] text-[#0A0F0D] font-bold text-sm hover:bg-[#f5b04a] transition-colors shadow-lg shadow-[rgba(239,159,39,0.3)]">
            Fazer upgrade para Agência — R$399,90/mês
          </Link>
          <Link href="/dashboard" className="text-sm text-[#5a5f5c] hover:text-[#9a9f9c] transition-colors">
            Voltar ao dashboard
          </Link>
        </div>

        <p className="text-xs text-[#3a3f3c] mt-6">
          Junto com o RadarLocal, o plano Agência inclui até 10 perfis, white-label e Competitor Radar.
        </p>
      </div>
    </div>
  );
}
