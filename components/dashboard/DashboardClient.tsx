"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    Star, Phone, Globe, MapPin, RefreshCw, TrendingUp, TrendingDown,
    Eye, Search, Navigation, MousePointerClick, ArrowRight,
    Zap, MessageSquare, FileText, Sparkles, ChevronRight, Lock,
} from "lucide-react";
import { ScoreGauge } from "@/components/dashboard/ScoreGauge";

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

const RADAR_DIMS = [
    { key: "photos", label: "Fotos", max: 25 },
    { key: "info", label: "Informações", max: 25 },
    { key: "reviews", label: "Reviews", max: 20 },
    { key: "posts", label: "Posts", max: 15 },
    { key: "geo", label: "GEO", max: 15 },
];

function RadarChart({ data, score }: { data: Record<string, number>, score: number }) {
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
            .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
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
            {rings.map((ratio) => (
                <path key={ratio} d={gridPoints(ratio)} fill="none" stroke="#2a2f2c" strokeWidth="1" />
            ))}
            {RADAR_DIMS.map((_, i) => {
                const p = point(i, 1);
                return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2a2f2c" strokeWidth="1" />;
            })}
            <path
                d={dataPath}
                fill="rgba(29,158,117,0.18)"
                stroke="#1D9E75"
                strokeWidth="2"
                strokeLinejoin="round"
                style={{ transition: "d 1.4s cubic-bezier(0.22,1,0.36,1)" }}
            />
            {dataPoints.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="3.5" fill="#1D9E75" stroke="#0A0F0D" strokeWidth="1.5"
                    style={{ transition: "cx 1.4s, cy 1.4s" }} />
            ))}
            {labelPts.map((l, i) => (
                <text key={i} x={l.x} y={l.y} textAnchor="middle" dominantBaseline="middle"
                    fill="#9a9f9c" fontSize="10" fontFamily="inherit">
                    {l.label}
                </text>
            ))}
            <text x={cx} y={cy - 8} textAnchor="middle" fill="#1D9E75" fontSize="22" fontWeight="700" fontFamily="inherit">
                {animated ? score : "–"}
            </text>
            <text x={cx} y={cy + 10} textAnchor="middle" fill="#5a5f5c" fontSize="9" fontFamily="inherit">
                de 100
            </text>
        </svg>
    );
}

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

const PRIO = {
    high: { bar: "bg-[#E24B4A]", glow: "shadow-[0_0_8px_rgba(226,75,74,0.4)]", label: "Urgente", text: "text-[#F09595]", bg: "bg-[rgba(226,75,74,0.08)]" },
    medium: { bar: "bg-[#EF9F27]", glow: "shadow-[0_0_8px_rgba(239,159,39,0.4)]", label: "Média", text: "text-[#EF9F27]", bg: "bg-[rgba(239,159,39,0.06)]" },
    low: { bar: "bg-[#1D9E75]", glow: "", label: "Baixa", text: "text-[#5DCAA5]", bg: "bg-[rgba(93,202,165,0.05)]" },
};

type DashboardClientProps = {
    business: any;
    latestAudit: any;
    pendingReviewsCount: number;
};

export function DashboardClient({ business, latestAudit, pendingReviewsCount }: DashboardClientProps) {
    const router = useRouter();
    const [isAuditing, setIsAuditing] = useState(false);

    async function handleAudit() {
        if (!business?.id) return;
        setIsAuditing(true);
        try {
            const res = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ businessId: business.id }),
            });
            if (res.ok) {
                router.refresh();
            } else {
                console.error("Audit failed");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsAuditing(false);
        }
    }
    const b = {
        name: business.name || "Negócio sem nome",
        category: business.category || "Categoria não definida",
        city: business.city || "",
        state: business.state || "",
        phone: business.phone || "---",
        website: business.website || "",
        googleRating: 4.8,
        totalReviews: 120,
        auditScore: latestAudit?.score || 0,
        lastAuditAt: latestAudit?.created_at ? new Date(latestAudit.created_at).toLocaleDateString("pt-BR") : "Nenhuma auditoria realizada ainda",
    };

    const auditData = latestAudit?.category_scores || { photos: 0, info: 0, reviews: 0, posts: 0, geo: 0 };
    const mockMax = { photos: 25, info: 25, reviews: 20, posts: 15, geo: 15 };

    const MOCK_TASKS = latestAudit?.tasks?.map((t: any, i: number) => ({
        id: String(i),
        priority: t.priority,
        category: t.category,
        text: t.text,
        href: t.category === "reviews" ? "/reviews" : t.category === "posts" ? "/posts" : t.category === "geo" ? "/geo" : "/auditoria"
    })) || [];

    const ins = {
        period: "últimos 30 dias",
        searches: { value: 1240, change: +12 },
        views: { value: 3420, change: +8 },
        calls: { value: 89, change: -3 },
        directions: { value: 156, change: +22 },
        clicks: { value: 234, change: +5 },
    };

    const MOCK_GEO = [
        { platform: "Maps", icon: "G", color: "#34A853", found: true, pos: 3 },
        { platform: "ChatGPT", icon: "C", color: "#10A37F", found: true, pos: null },
        { platform: "Gemini", icon: "G", color: "#4285F4", found: false, pos: null },
        { platform: "Perplexity", icon: "P", color: "#7C5CFC", found: true, pos: 1 },
        { platform: "AI Overview", icon: "A", color: "#EF9F27", found: false, pos: null },
    ];
    const geoFound = MOCK_GEO.filter((g) => g.found).length;

    return (
        <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd]">
            {/* Hero banner */}
            <div className="relative overflow-hidden border-b border-[#1a1f1c]">
                <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0"
                    style={{ background: "radial-gradient(ellipse 70% 120% at 50% -20%, rgba(29,158,117,0.12) 0%, transparent 70%)" }}
                />
                <div className="max-w-[1200px] mx-auto px-5 py-6 relative">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-5">
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
                                    {b.city && <span className="flex items-center gap-1 text-xs text-[#5a5f5c]"><MapPin className="w-3 h-3" />{b.city}</span>}
                                    {b.phone && <span className="flex items-center gap-1 text-xs text-[#5a5f5c]"><Phone className="w-3 h-3" />{b.phone}</span>}
                                    {b.website && (
                                        <a href={`https://${b.website}`} target="_blank" rel="noopener noreferrer"
                                            className="flex items-center gap-1 text-xs text-[#1D9E75] hover:text-[#5DCAA5] transition-colors">
                                            <Globe className="w-3 h-3" />{b.website}
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                            <StatPill label="Auditoria" value={b.auditScore} suffix="/100" color="#1D9E75" />
                            <StatPill label="Reviews pendentes" value={pendingReviewsCount} color="#E24B4A" />
                            <StatPill label="Buscas/mês" value={ins.searches.value} change={ins.searches.change} />
                            <button onClick={handleAudit} disabled={isAuditing} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#1D9E75] text-white text-xs font-semibold hover:bg-[#3DB88E] transition-colors shadow-lg shadow-[rgba(29,158,117,0.3)] disabled:opacity-50">
                                {isAuditing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />} {isAuditing ? "Auditando..." : "Nova auditoria"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-b border-[#1a1f1c] bg-[#0d1210]">
                <div className="max-w-[1200px] mx-auto px-5 py-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
                    <span className="text-xs text-[#5a5f5c] flex-shrink-0">Ação rápida:</span>
                    <Link href="/reviews" className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-90 text-[#E24B4A] bg-[rgba(226,75,74,0.08)] border-[rgba(226,75,74,0.2)]"><MessageSquare className="w-3.5 h-3.5" />Responder {pendingReviewsCount} reviews</Link>
                    <Link href="/posts" className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-90 text-[#1D9E75] bg-[rgba(29,158,117,0.08)] border-[rgba(29,158,117,0.2)]"><FileText className="w-3.5 h-3.5" />Gerar post com IA</Link>
                    <Link href="/geo" className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-90 text-[#7C5CFC] bg-[rgba(124,92,252,0.08)] border-[rgba(124,92,252,0.2)]"><Sparkles className="w-3.5 h-3.5" />Verificar GEO</Link>
                    <Link href="/auditoria" className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:opacity-90 text-[#9a9f9c] bg-transparent border-[#2a2f2c]"><ChevronRight className="w-3.5 h-3.5" />Ver auditoria completa</Link>
                </div>
            </div>

            <div className="max-w-[1200px] mx-auto px-5 py-6 space-y-6">
                <div className="grid lg:grid-cols-[320px_1fr] gap-6">
                    <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-[14px] font-semibold text-[#FAFBFA]">Score de saúde</h2>
                                <p className="text-xs text-[#5a5f5c]">Última atualização: {b.lastAuditAt}</p>
                            </div>
                            <Link href="/auditoria" className="text-xs text-[#1D9E75] hover:text-[#5DCAA5] flex items-center gap-1 transition-colors">Detalhes <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                        {b.auditScore === 0 ? (
                            <div className="flex flex-col items-center justify-center p-6 text-center">
                                <span className="text-[#9a9f9c] text-sm mb-4">Ainda sem dados.</span>
                                <button onClick={handleAudit} disabled={isAuditing} className="flex flex-row items-center gap-2 px-4 py-2 bg-[rgba(29,158,117,0.1)] border border-[#1D9E75] text-[#1D9E75] rounded-xl text-sm font-semibold hover:bg-[rgba(29,158,117,0.2)] disabled:opacity-50">
                                    {isAuditing && <RefreshCw className="w-4 h-4 animate-spin" />}
                                    Gerar Auditoria
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex justify-center"><RadarChart data={auditData} score={b.auditScore} /></div>
                                <div className="grid grid-cols-5 gap-1 mt-2">
                                    {[
                                        { label: "Fotos", val: auditData.photos, max: mockMax.photos },
                                        { label: "Info", val: auditData.info, max: mockMax.info },
                                        { label: "Review", val: auditData.reviews, max: mockMax.reviews },
                                        { label: "Posts", val: auditData.posts, max: mockMax.posts },
                                        { label: "GEO", val: auditData.geo, max: mockMax.geo },
                                    ].map((d) => {
                                        const pct = Math.round((d.val / d.max) * 100);
                                        const color = pct >= 70 ? "#1D9E75" : pct >= 40 ? "#EF9F27" : "#E24B4A";
                                        return (
                                            <div key={d.label} className="flex flex-col items-center gap-1">
                                                <div className="w-full h-1 rounded-full bg-[#2a2f2c] overflow-hidden"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} /></div>
                                                <span className="text-[9px] text-[#5a5f5c] text-center">{d.label}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                    </div>
                    <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-[14px] font-semibold text-[#FAFBFA]">Tarefas prioritárias</h2>
                                <p className="text-xs text-[#5a5f5c]">{MOCK_TASKS.length} ações para melhorar seu score</p>
                            </div>
                            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[rgba(29,158,117,0.08)] border border-[rgba(29,158,117,0.2)] text-[#1D9E75] hover:bg-[rgba(29,158,117,0.14)] transition-colors"><Zap className="w-3.5 h-3.5" /> Gerar com IA</button>
                        </div>
                        <div className="flex flex-col gap-2">
                            {MOCK_TASKS.map((t: any) => {
                                const p = PRIO[t.priority as keyof typeof PRIO] || PRIO.medium;
                                return (
                                    <Link key={t.id} href={t.href} className={`group flex items-center gap-3 p-3 rounded-xl border border-transparent hover:border-[#2a2f2c] ${p.bg} hover:bg-[rgba(255,255,255,0.03)] transition-all`}>
                                        <div className={`w-1 h-8 rounded-full flex-shrink-0 ${p.bar} ${p.glow}`} />
                                        <div className="flex-1 min-w-0"><p className="text-sm text-[#dadedd] leading-snug">{t.text}</p></div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${p.text}`} style={{ background: p.bar.replace("bg-[", "").replace("]", "") + "18" }}>{p.label}</span>
                                            <ChevronRight className="w-3.5 h-3.5 text-[#5a5f5c] group-hover:text-[#9a9f9c] transition-colors" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-[1fr_340px] gap-6">
                    <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-5">
                            <div>
                                <h2 className="text-[14px] font-semibold text-[#FAFBFA]">Métricas do Google Business</h2>
                                <p className="text-xs text-[#5a5f5c]">{ins.period}</p>
                            </div>
                            <Link href="/relatorios" className="text-xs text-[#1D9E75] hover:text-[#5DCAA5] flex items-center gap-1 transition-colors">Relatório completo <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {[
                                { icon: Search, label: "Buscas diretas", ...ins.searches },
                                { icon: Eye, label: "Visualizações", ...ins.views },
                                { icon: Navigation, label: "Rotas solicitadas", ...ins.directions },
                                { icon: Phone, label: "Ligações", ...ins.calls },
                                { icon: MousePointerClick, label: "Cliques no site", ...ins.clicks },
                            ].map((m) => (
                                <div key={m.label} className="bg-[#0d1210] border border-[#2a2f2c] rounded-xl p-4 hover:border-[#3a3f3c] transition-colors">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-7 h-7 rounded-lg bg-[rgba(29,158,117,0.1)] flex items-center justify-center"><m.icon className="w-3.5 h-3.5 text-[#1D9E75]" /></div>
                                        <span className={`flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full ${m.change >= 0 ? "text-[#5DCAA5] bg-[rgba(93,202,165,0.1)]" : "text-[#F09595] bg-[rgba(226,75,74,0.1)]"}`}>
                                            {m.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}{m.change >= 0 ? "+" : ""}{m.change}%
                                        </span>
                                    </div>
                                    <div className="text-2xl font-display font-bold text-[#FAFBFA] tabular-nums"><Counter to={m.value} /></div>
                                    <div className="text-[11px] text-[#5a5f5c] mt-0.5">{m.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-[#1a1f1c] border border-[#2a2f2c] rounded-2xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-[14px] font-semibold text-[#FAFBFA]">Monitor GEO</h2>
                                <p className="text-xs text-[#5a5f5c]"><span className="text-[#1D9E75] font-semibold">{geoFound}</span>/{MOCK_GEO.length} plataformas</p>
                            </div>
                            <Link href="/geo" className="text-xs text-[#1D9E75] hover:text-[#5DCAA5] flex items-center gap-1 transition-colors">Ver <ArrowRight className="w-3 h-3" /></Link>
                        </div>
                        <div className="flex justify-center mb-4"><ScoreGauge score={Math.round((geoFound / MOCK_GEO.length) * 100)} size={120} /></div>
                        <div className="flex flex-col gap-2">
                            {MOCK_GEO.map((g) => (
                                <div key={g.platform} className={`flex items-center gap-3 px-3 py-2 rounded-xl ${g.found ? "bg-[rgba(29,158,117,0.06)] border border-[rgba(29,158,117,0.15)]" : "bg-[rgba(255,255,255,0.02)] border border-[#2a2f2c]"}`}>
                                    <div className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: g.color + "22", color: g.color }}>{g.icon}</div>
                                    <span className="text-xs flex-1 text-[#dadedd]">{g.platform}</span>
                                    {g.found ? <span className="text-[10px] font-bold text-[#5DCAA5]">{g.pos ? `#${g.pos}` : "✓"}</span> : <span className="text-[10px] text-[#E24B4A]">✗</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-[rgba(239,159,39,0.25)] bg-gradient-to-r from-[#0d1210] to-[#0a0f0d] p-5">
                    <div aria-hidden className="absolute right-0 top-0 w-64 h-full opacity-10" style={{ background: "radial-gradient(ellipse at right center, #EF9F27 0%, transparent 70%)" }} />
                    <div className="relative flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-[rgba(239,159,39,0.12)] border border-[rgba(239,159,39,0.2)] flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-[#EF9F27]" /></div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-[15px] font-semibold text-[#FAFBFA]">RadarLocal — Heat Map de Ranking</h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(239,159,39,0.15)] text-[#EF9F27] uppercase tracking-wider">Agência</span>
                            </div>
                            <p className="text-xs text-[#5a5f5c]">Veja exatamente onde você aparece no Google Maps por bairro. Heat map interativo com 49 pontos geográficos.</p>
                        </div>
                        <Link href="/configuracoes" className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[rgba(239,159,39,0.12)] border border-[rgba(239,159,39,0.25)] text-[#EF9F27] text-xs font-semibold hover:bg-[rgba(239,159,39,0.2)] transition-colors"><Lock className="w-3.5 h-3.5" />Fazer upgrade</Link>
                    </div>
                </div>

            </div>
        </div>
    );
}
