"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Star, Phone, Globe, MapPin, RefreshCw, TrendingUp, TrendingDown,
  Eye, Search, Navigation, MousePointerClick, AlertCircle, ArrowRight,
  Zap, MessageSquare, FileText, Sparkles, ChevronRight, Lock,
} from "lucide-react";
import { ScoreGauge } from "@/components/dashboard/ScoreGauge";

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_BUSINESS = {
  name: "Casa da Pizza",
  category: "Restaurante · Pizzaria",
  neighborhood: "Moema",
  city: "São Paulo",
  state: "SP",
  phone: "(11) 3456-7890",
  website: "casadapizza.com.br",
  googleRating: 4.3,
  totalReviews: 847,
  auditScore: 72,
  lastAuditAt: "hoje às 09:14",
};

const MOCK_AUDIT = { photos: 21, info: 22, reviews: 12, posts: 7, geo: 9 };
const MOCK_MAX =   { photos: 25, info: 25, reviews: 20, posts: 15, geo: 15 };

const MOCK_TASKS = [
  { id: "1", priority: "high" as const,   category: "reviews", text: "Responder 23 avaliações sem resposta", href: "/reviews" },
  { id: "2", priority: "high" as const,   category: "posts",   text: "Publicar um Google Post esta semana",   href: "/posts" },
  { id: "3", priority: "medium" as const, category: "geo",     text: "Você não aparece no Gemini ainda",      href: "/geo" },
  { id: "4", priority: "medium" as const, category: "info",    text: "Adicionar horários especiais feriados", href: "/auditoria" },
  { id: "5", priority: "low" as const,    category: "photos",  text: "Adicionar fotos de produtos",           href: "/auditoria" },
];

const MOCK_INSIGHTS = {
  period: "últimos 30 dias",
  searches:  { value: 1240, change: +12 },
  views:     { value: 3420, change: +8  },
  calls:     { value: 89,   change: -3  },
  directions:{ value: 156,  change: +22 },
  clicks:    { value: 234,  change: +5  },
};

const MOCK_GEO = [
  { platform: "Maps",       icon: "G", color: "#34A853", found: true,  pos: 3  },
  { platform: "ChatGPT",    icon: "C", color: "#10A37F", found: true,  pos: null },
  { platform: "Gemini",     icon: "G", color: "#4285F4", found: false, pos: null },
  { platform: "Perplexity", icon: "P", color: "#7C5CFC", found: true,  pos: 1  },
  { platform: "AI Overview",icon: "A", color: "#EF9F27", found: false, pos: null },
];

// ─── Radar chart ─────────────────────────────────────────────────────────────

const RADAR_DIMS = [
  { key: "photos",  label: "Fotos",      max: 25 },
  { key: "info",    label: "Informações", max: 25 },
  { key: "reviews", label: "Reviews",    max: 20 },
  { key: "posts",   label: "Posts",      max: 15 },
  { key: "geo",     label: "GEO",        max: 15 },
];

function RadarChart({ data }: { data: Record<string, number> }) {
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 300); return () => clearTimeout(t); }, []);

  const cx = 110; const cy = 110; const r = 88;
  const n = RADAR_DIMS.length;

  function point(i: number, ratio: number) {
    const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
    return { x: cx + r * ratio * Math.cos(angle), y: cy + r * ratio * Math.sin(angle) };
  }

  const rings = [0.25, 0.5, 0.75, 1];
  const gridPoints = (ratio: number) =>
    RADAR_DIMS.map((_, i) => point(i, ratio))
      .map((p, i, arr) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" ") + " Z";

  const dataPoints = RADAR_DIMS.map((d, i) => {
    const ratio = animated ? (data[d.key] ?? 0) / d.max : 0;
    return point(i, ratio);
  });
  const dataPath =
    dataPoints.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ") + " Z";

  const labelPts = RADAR_DIMS.map((d, i) => {
    const p = point(i, 1.22);
    return { ...p, label: d.label };
  });

  return (
    <svg viewBox="0 0 220 220" className="w-full max-w-[220px]">
      {/* Grid rings */}
      {rings.map((ratio) => (
        <path key={ratio} d={gridPoints(ratio)} fill="none" stroke="#2a2f2c" strokeWidth="1" />
      ))}
      {/* Axes */}
      {RADAR_DIMS.map((_, i) => {
        const p = point(i, 1);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2a2f2c" strokeWidth="1" />;
      })}
      {/* Data */}
      <path
        d={dataPath}
        fill="rgba(29,158,117,0.18)"
        stroke="#1D9E75"
        strokeWidth="2"
        strokeLinejoin="round"
        style={{ transition: "d 1.4s cubic-bezier(0.22,1,0.36,1)" }}
      />
      {/* Data dots */}
      {dataPoints.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#1D9E75" stroke="#0A0F0D" strokeWidth="1.5"
          style={{ transition: "cx 1.4s, cy 1.4s" }} />
      ))}
      {/* Labels */}
      {labelPts.map((l, i) => (
        <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle"
          fill="#9a9f9c" fontSize="10" fontFamily="inherit">
          {l.label}
        </text>
      ))}
      {/* Center score */}
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#1D9E75" fontSize="22" fontWeight="700" fontFamily="inherit">
        {animated ? MOCK_BUSINESS.auditScore : "–"}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#5a5f5c" fontSize="9" fontFamily="inherit">
        de 100
      </text>
    </svg>
  );
}

// ─── Animated counter ─────────────────────────────────────────────────────────

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef(false);
  useEffect(() => {
    if (ref.current) return; ref.current = true;
    let start = 0;
    const step = Math.ceil(to / 40);
    const id = setInterval(() => {
      start = Math.min(start + step, to);
      setVal(start);
      if (start >= to) clearInterval(id);
    }, 30);
    return () => clearInterval(id);
  }, [to]);
  return <>{val.toLocaleString("pt-BR")}{suffix}</>;
}

// ─── Priority config ──────────────────────────────────────────────────────────

const PRIO = {
  high:   { bar: "bg-[#E24B4A]", glow: "shadow-[0_0_8px_rgba(226,75,74,0.4)]", label: "Urgente", text: "text-[#F09595]", bg: "bg-[rgba(226,75,74,0.08)]" },
  medium: { bar: "bg-[#EF9F27]", glow: "shadow-[0_0_8px_rgba(239,159,39,0.4)]", label: "Média",   text: "text-[#EF9F27]", bg: "bg-[rgba(239,159,39,0.06)]" },
  low:    { bar: "bg-[#1D9E75]", glow: "",                                        label: "Baixa",   text: "text-[#5DCAA5]", bg: "bg-[rgba(93,202,165,0.05)]" },
};

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const b = MOCK_BUSINESS;
  const ins = MOCK_INSIGHTS;
  const geoFound = MOCK_GEO.filter((g) => g.found).length;
  const pendingReviews = 23;

  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">

      {/* ── Hero banner ─────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-[#1a1f1c]">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 120% at 50% -20%, rgba(29,158,117,0.12) 0%, transparent 70%)" }}
        />
        <div className="max-w-[1200px] mx-auto px-5 py-6 relative">
          <div className="flex flex-col lg:flex-row lg:items-center gap-5">

            {/* Business info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0F6E56] to-[#5DCAA5] flex items-center justify-center text-2xl font-bold text-white flex-shrink-0 shadow-lg shadow-[rgba(29,158,117,0.3)]">
                {b.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-display text-xl font-bold text-[#FAFBFA]">{b.name}</h1>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[rgba(239,159,39,0.12)] border border-[rgba(239,159,39,0.2)]">
                    <Star className="w-3 h-3 fill-[#EF9F27] text-[#EF9F27]" />
                    <span className="text-xs font-semibold text-[#EF9F27]">{b.googleRating}</span>
                    <span className="text-xs text-[#5a5f5c]">({b.totalReviews.toLocaleString("pt-BR")})</span>
                  </div>
                </div>
                <p className="text-sm text-[#5a5f5c]">{b.category}</p>
                <div className="flex items-center gap-3 mt-1 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-[#5a5f5c]"><MapPin className="w-3 h-3" />{b.neighborhood}, {b.city}</span>
                  <span className="flex items-center gap-1 text-xs text-[#5a5f5c]"><Phone className="w-3 h-3" />{b.phone}</span>
                  <a href={`https://${b.website}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-[#1D9E75] hover:text-[#5DCAA5] transition-colors">
                    <Globe className="w-3 h-3" />{b.website}
                  </a>
                </div>
              </div>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
              <StatPill label="Auditoria" value={b.auditScore} suffix="/100" color="#1D9E75" />
              <StatPill label="Reviews pendentes" value={pendingReviews} color="#E24B4A" />
              <StatPill label="Buscas/mês" value={ins.searches.value} change={ins.searches.change} />
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D9E75] text-white text-xs font-semibold hover:bg-[#3DB88E] transition-colors shadow-lg shadow-[rgba(29,158,117,0.3)]">
                <RefreshCw className="w-3.5 h-3.5" />
                Nova auditoria
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Quick actions ───────────────────────────────────────────── */}
      <div className="border-b border-[#1a1f1c] bg-[#0d1210]">
        <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="text-xs text-[#5a5f5c] flex-shrink-0">Ação rápida:</span>
          {[
            { label: `Responder ${pendingReviews} reviews`, icon: MessageSquare, href: "/reviews", color: "#E24B4A", bg: "rgba(226,75,74,0.08)", border: "rgba(226,75,74,0.2)" },
            { label: "Gerar post com IA", icon: FileText, href: "/posts", color: "#1D9E75", bg: "rgba(29,158,117,0.08)", border: "rgba(29,158,117,0.2)" },
            { label: "Verificar GEO", icon: Sparkles, href: "/geo", color: "#7C5CFC", bg: "rgba(124,92,252,0.08)", border: "rgba(124,92,252,0.2)" },
            { label: "Ver auditoria completa", icon: ChevronRight, href: "/auditoria", color: "#9a9f9c", bg: "transparent", border: "#2a2f2c" },
          ].map((a) => (
            <Link key={a.href} href={a.href}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-90"
              style={{ color: a.color, background: a.bg, borderColor: a.border }}>
              <a.icon className="w-3.5 h-3.5" />
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="max-w-[1200px] mx-auto px-5 py-6 space-y-6">

        {/* ── Row 1: Radar + Tasks ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6">

          {/* Radar chart card */}
          <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-[#FAFBFA]">Score de saúde</h2>
                <p className="text-xs text-[#5a5f5c]">5 dimensões</p>
              </div>
              <Link href="/auditoria" className="text-xs text-[#1D9E75] hover:text-[#5DCAA5] flex items-center gap-1 transition-colors">
                Detalhes <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex justify-center">
              <RadarChart data={MOCK_AUDIT} />
            </div>
            {/* Dimension summary */}
            <div className="grid grid-cols-5 gap-1 mt-2">
              {[
                { label: "Fotos",  val: MOCK_AUDIT.photos,  max: MOCK_MAX.photos },
                { label: "Info",   val: MOCK_AUDIT.info,    max: MOCK_MAX.info },
                { label: "Review", val: MOCK_AUDIT.reviews, max: MOCK_MAX.reviews },
                { label: "Posts",  val: MOCK_AUDIT.posts,   max: MOCK_MAX.posts },
                { label: "GEO",    val: MOCK_AUDIT.geo,     max: MOCK_MAX.geo },
              ].map((d) => {
                const pct = Math.round((d.val / d.max) * 100);
                const color = pct >= 70 ? "#1D9E75" : pct >= 40 ? "#EF9F27" : "#E24B4A";
                return (
                  <div key={d.label} className="flex flex-col items-center gap-1">
                    <div className="w-full h-1 rounded-full bg-[#2a2f2c] overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-[9px] text-[#5a5f5c] text-center">{d.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Priority tasks */}
          <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-[#FAFBFA]">Tarefas prioritárias</h2>
                <p className="text-xs text-[#5a5f5c]">{MOCK_TASKS.length} ações para melhorar seu score</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[rgba(29,158,117,0.08)] border border-[rgba(29,158,117,0.2)] text-[#1D9E75] hover:bg-[rgba(29,158,117,0.14)] transition-colors">
                <Zap className="w-3.5 h-3.5" />
                Gerar com IA
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {MOCK_TASKS.map((task) => {
                const p = PRIO[task.priority];
                return (
                  <Link key={task.id} href={task.href}
                    className={`group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[#2a2f2c] ${p.bg} hover:bg-[rgba(255,255,255,0.03)] transition-all`}>
                    {/* Priority bar */}
                    <div className={`w-1 h-8 rounded-full flex-shrink-0 ${p.bar} ${p.glow}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-[#dadedd] leading-snug">{task.text}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.text}`}
                        style={{ background: p.bar.replace("bg-[", "").replace("]", "") + "18" }}>
                        {p.label}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#5a5f5c] group-hover:text-[#9a9f9c] transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Row 2: Metrics + GEO ────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-6">

          {/* Google metrics */}
          <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-[14px] font-semibold text-[#FAFBFA]">Métricas do Google Business</h2>
                <p className="text-xs text-[#5a5f5c]">{ins.period}</p>
              </div>
              <Link href="/relatorios" className="text-xs text-[#1D9E75] hover:text-[#5DCAA5] flex items-center gap-1 transition-colors">
                Relatório completo <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { icon: Search,           label: "Buscas diretas",   ...ins.searches  },
                { icon: Eye,              label: "Visualizações",     ...ins.views     },
                { icon: Navigation,       label: "Rotas solicitadas", ...ins.directions},
                { icon: Phone,            label: "Ligações",          ...ins.calls     },
                { icon: MousePointerClick,label: "Cliques no site",   ...ins.clicks    },
              ].map((m) => {
                const pos = m.change >= 0;
                return (
                  <div key={m.label} className="bg-[#0d1210] border border-[#2a2f2c] rounded-xl p-4 hover:border-[#3a3f3c] transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-7 h-7 rounded-lg bg-[rgba(29,158,117,0.1)] flex items-center justify-center">
                        <m.icon className="w-3.5 h-3.5 text-[#1D9E75]" />
                      </div>
                      <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${pos ? "text-[#5DCAA5] bg-[rgba(93,202,165,0.1)]" : "text-[#F09595] bg-[rgba(226,75,74,0.1)]"}`}>
                        {pos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {pos ? "+" : ""}{m.change}%
                      </span>
                    </div>
                    <div className="text-2xl font-display font-bold text-[#FAFBFA] tabular-nums">
                      <Counter to={m.value} />
                    </div>
                    <div className="text-[11px] text-[#5a5f5c] mt-0.5">{m.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* GEO Summary */}
          <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-[14px] font-semibold text-[#FAFBFA]">Monitor GEO</h2>
                <p className="text-xs text-[#5a5f5c]">
                  <span className="text-[#1D9E75] font-semibold">{geoFound}</span>/{MOCK_GEO.length} plataformas
                </p>
              </div>
              <Link href="/geo" className="text-xs text-[#1D9E75] hover:text-[#5DCAA5] flex items-center gap-1 transition-colors">
                Ver <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {/* Radial progress */}
            <div className="flex justify-center mb-4">
              <ScoreGauge score={Math.round((geoFound / MOCK_GEO.length) * 100)} size={120} />
            </div>

            <div className="flex flex-col gap-2">
              {MOCK_GEO.map((g) => (
                <div key={g.platform}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl ${g.found ? "bg-[rgba(29,158,117,0.06)] border border-[rgba(29,158,117,0.15)]" : "bg-[rgba(255,255,255,0.02)] border border-[#2a2f2c]"}`}>
                  <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={{ background: g.color + "22", color: g.color }}>
                    {g.icon}
                  </div>
                  <span className="text-xs flex-1 text-[#dadedd]">{g.platform}</span>
                  {g.found ? (
                    <span className="text-[10px] font-bold text-[#5DCAA5]">
                      {g.pos ? `#${g.pos}` : "✓"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-[#E24B4A]">✗</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RadarLocal promo banner ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(239,159,39,0.25)] bg-gradient-to-r from-[#0d1210] to-[#0a0f0d] p-5">
          <div aria-hidden className="absolute right-0 top-0 w-64 h-full opacity-10"
            style={{ background: "radial-gradient(ellipse at right center, #EF9F27 0%, transparent 70%)" }} />
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[rgba(239,159,39,0.12)] border border-[rgba(239,159,39,0.2)] flex items-center justify-center flex-shrink-0">
              <MapPin className="w-6 h-6 text-[#EF9F27]" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[15px] font-semibold text-[#FAFBFA]">RadarLocal — Heat Map de Ranking</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(239,159,39,0.15)] text-[#EF9F27] uppercase tracking-wider">
                  Agência
                </span>
              </div>
              <p className="text-xs text-[#5a5f5c]">
                Veja exatamente onde você aparece no Google Maps por bairro. Heat map interativo com 49 pontos geográficos.
              </p>
            </div>
            <Link href="/configuracoes"
              className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(239,159,39,0.12)] border border-[rgba(239,159,39,0.25)] text-[#EF9F27] text-xs font-semibold hover:bg-[rgba(239,159,39,0.2)] transition-colors">
              <Lock className="w-3.5 h-3.5" />
              Fazer upgrade
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────

function StatPill({ label, value, suffix = "", change, color = "#9a9f9c" }: {
  label: string; value: number; suffix?: string; change?: number; color?: string;
}) {
  return (
    <div className="flex flex-col px-3 py-2 rounded-xl bg-[#1a1f1c] border border-[#2a2f2c]">
      <span className="text-[10px] text-[#5a5f5c] uppercase tracking-wider">{label}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-display font-bold" style={{ color }}>
          <Counter to={value} suffix={suffix} />
        </span>
        {change !== undefined && (
          <span className={`text-[11px] font-medium ${change >= 0 ? "text-[#5DCAA5]" : "text-[#F09595]"}`}>
            {change >= 0 ? "+" : ""}{change}%
          </span>
        )}
      </div>
    </div>
  );
}
