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

export const metadata = { title: "Relatórios" };

// ─── Mock data ────────────────────────────────────────────────────────────────

const SCORE_HISTORY = [
  { month: "Out", score: 48 },
  { month: "Nov", score: 55 },
  { month: "Dez", score: 58 },
  { month: "Jan", score: 63 },
  { month: "Fev", score: 68 },
  { month: "Mar", score: 72 },
];

const INSIGHTS_30 = [
  { icon: Search, label: "Buscas diretas", value: 1240, change: +12, prev: 1107 },
  { icon: Eye, label: "Visualizações", value: 3420, change: +8, prev: 3167 },
  { icon: Phone, label: "Ligações", value: 89, change: -3, prev: 92 },
  { icon: Navigation, label: "Rotas solicitadas", value: 156, change: +22, prev: 128 },
  { icon: MousePointerClick, label: "Cliques no site", value: 234, change: +5, prev: 223 },
];

const REVIEW_STATS = {
  total: 847,
  avg: 4.3,
  responded: 824,
  responseRate: 97,
  byRating: [
    { stars: 5, count: 524, pct: 62 },
    { stars: 4, count: 186, pct: 22 },
    { stars: 3, count: 76, pct: 9 },
    { stars: 2, count: 38, pct: 4.5 },
    { stars: 1, count: 23, pct: 2.5 },
  ],
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RelatoriosPage() {
  const maxScore = Math.max(...SCORE_HISTORY.map((h) => h.score));
  const scoreGain =
    SCORE_HISTORY[SCORE_HISTORY.length - 1].score - SCORE_HISTORY[0].score;

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
            {SCORE_HISTORY.map((h, i) => {
              const isLast = i === SCORE_HISTORY.length - 1;
              const height = `${(h.score / (maxScore + 10)) * 100}%`;
              return (
                <div
                  key={h.month}
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
                  <span className="text-xs text-[#5a5f5c]">{h.month}</span>
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
            {INSIGHTS_30.map((item) => {
              const Icon = item.icon;
              const positive = item.change >= 0;
              return (
                <div
                  key={item.label}
                  className="bg-[#0d1210] border border-[#2a2f2c] rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-8 h-8 rounded-lg bg-[rgba(29,158,117,0.1)] flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#1D9E75]" />
                    </div>
                    <span
                      className={`flex items-center gap-0.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                        positive
                          ? "text-[#5DCAA5] bg-[rgba(93,202,165,0.1)]"
                          : "text-[#F09595] bg-[rgba(226,75,74,0.1)]"
                      }`}
                    >
                      {positive ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      {positive ? "+" : ""}
                      {item.change}%
                    </span>
                  </div>
                  <div className="text-2xl font-display font-bold text-[#FAFBFA]">
                    {item.value.toLocaleString("pt-BR")}
                  </div>
                  <div className="text-xs text-[#5a5f5c] mt-0.5">{item.label}</div>
                  <div className="text-[11px] text-[#3a3f3c] mt-1">
                    Mês anterior: {item.prev.toLocaleString("pt-BR")}
                  </div>
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
                  {REVIEW_STATS.avg}
                </div>
                <div className="flex justify-center mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(REVIEW_STATS.avg)
                          ? "fill-[#EF9F27] text-[#EF9F27]"
                          : "text-[#2a2f2c]"
                      }`}
                    />
                  ))}
                </div>
                <div className="text-xs text-[#5a5f5c] mt-1">
                  {REVIEW_STATS.total.toLocaleString("pt-BR")} avaliações
                </div>
              </div>
              <div className="flex-1">
                {REVIEW_STATS.byRating.map((r) => (
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
                  {REVIEW_STATS.responseRate}%
                </div>
                <div className="text-xs text-[#5a5f5c]">Taxa de resposta</div>
              </div>
              <div className="w-px h-8 bg-[#2a2f2c]" />
              <div>
                <div className="text-xl font-display font-bold text-[#FAFBFA]">
                  {REVIEW_STATS.responded.toLocaleString("pt-BR")}
                </div>
                <div className="text-xs text-[#5a5f5c]">Respondidas</div>
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
