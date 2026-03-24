import { Navbar } from "@/components/marketing/Navbar";
import { ScoreCardMockup } from "@/components/marketing/ScoreCardMockup";
import { RevealItem } from "@/components/marketing/RevealItem";
import { CtaInput } from "@/components/marketing/CtaInput";

// ─── Data ────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
      </svg>
    ),
    title: "Auditoria completa do perfil",
    description:
      "Score 0-100 calculado em 5 dimensões: fotos, informações, reviews, posts e presença em IAs. Checklist priorizado para você saber exatamente o que fazer.",
    link: "#features",
    linkText: "Ver como funciona →",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Respostas a reviews com IA",
    description:
      "Gera respostas personalizadas para cada avaliação — positiva, negativa ou neutra — no tom da sua marca. Um clique para publicar direto no Google.",
    link: "#features",
    linkText: "Ver exemplos →",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Monitor GEO — IAs generativas",
    description:
      "Verifica se você aparece nas respostas do ChatGPT, Gemini e Perplexity quando alguém busca seu serviço na sua cidade. Primeiro no Brasil.",
    link: "#geo",
    linkText: "Entender o GEO →",
  },
];

const GEO_QUERIES = [
  {
    query: "melhor pizzaria em moema",
    platform: "ChatGPT",
    found: true,
    snippet: "...A **Casa da Pizza** em Moema é frequentemente citada pela qualidade da massa e atendimento...",
  },
  {
    query: "pizzaria delivery sp",
    platform: "Gemini",
    found: false,
    snippet: null,
  },
  {
    query: "pizza artesanal são paulo",
    platform: "Perplexity",
    found: true,
    snippet: "...Entre as opções de pizza artesanal, a **Casa da Pizza** se destaca pelo...",
  },
];

const PLANS = [
  {
    name: "Essencial",
    price: "49",
    description: "Para quem quer começar a aparecer no Google",
    features: [
      "1 perfil Google Meu Negócio",
      "Auditoria completa com score",
      "Checklist de melhorias",
      "5 respostas IA/mês",
      "2 posts gerados/mês",
      "Relatório mensal",
    ],
    cta: "Começar grátis",
    popular: false,
  },
  {
    name: "Profissional",
    price: "99",
    description: "Para negócios que querem dominar a busca local",
    features: [
      "1 perfil Google Meu Negócio",
      "Respostas IA ilimitadas",
      "4 posts gerados/mês",
      "Monitor GEO (ChatGPT, Gemini, Perplexity)",
      "Ranking no Google Maps",
      "Relatório PDF mensal",
    ],
    cta: "Começar grátis",
    popular: true,
  },
  {
    name: "Agência",
    price: "299",
    description: "Para agências e multi-unidades",
    features: [
      "Até 5 perfis",
      "Tudo do Profissional",
      "Monitor GEO (5 plataformas)",
      "White-label (sua marca)",
      "Acesso à API",
      "Suporte prioritário",
    ],
    cta: "Falar com vendas",
    popular: false,
  },
];

// ─── Page ────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] font-sans overflow-x-hidden">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="relative pt-44 pb-28 px-6 text-center overflow-hidden">
        {/* Radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 flex items-start justify-center"
          style={{
            background:
              "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(29,158,117,0.18) 0%, transparent 70%)",
          }}
        />

        <div className="relative max-w-[800px] mx-auto">
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[rgba(93,202,165,0.2)] bg-[rgba(29,158,117,0.08)] text-[#5DCAA5] text-sm mb-8"
            style={{
              animation: "fadeUp 0.6s ease both",
              animationDelay: "0.1s",
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
            Novo: Monitor GEO para IAs generativas
          </div>

          <h1
            className="font-display text-[clamp(2.6rem,6vw,4.5rem)] font-bold leading-[1.1] tracking-[-0.02em] text-[#FAFBFA] mb-6"
            style={{ animation: "fadeUp 0.6s ease both", animationDelay: "0.2s" }}
          >
            Quando alguém busca{" "}
            <br className="hidden sm:block" />
            o que você vende,{" "}
            <span className="text-[#1D9E75]">você aparece?</span>
          </h1>

          <p
            className="text-[clamp(1rem,2vw,1.2rem)] text-[#9a9f9c] leading-relaxed max-w-[600px] mx-auto mb-10"
            style={{ animation: "fadeUp 0.6s ease both", animationDelay: "0.35s" }}
          >
            O Vitrine.ai audita seu Google Meu Negócio, gera respostas a reviews
            com IA e monitora se você aparece no ChatGPT, Gemini e Perplexity.
            Tudo em português, por R$49/mês.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16"
            style={{ animation: "fadeUp 0.6s ease both", animationDelay: "0.45s" }}
          >
            <a
              href="#cta"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-[10px] bg-[#1D9E75] text-white text-[15px] font-medium transition-all duration-200 hover:bg-[#3DB88E] hover:-translate-y-px hover:shadow-[0_8px_40px_rgba(29,158,117,0.35)]"
            >
              Analisar meu negócio grátis
            </a>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-[10px] border border-[#3a3f3c] text-[#9a9f9c] text-[15px] font-medium transition-all duration-200 hover:border-[#5a5f5c] hover:text-[#FAFBFA]"
            >
              Ver como funciona
            </a>
          </div>

          {/* Score card mockup */}
          <div style={{ animation: "fadeUp 0.7s ease both", animationDelay: "0.55s" }}>
            <ScoreCardMockup />
          </div>
        </div>
      </section>

      {/* ── Social proof ──────────────────────────────────── */}
      <RevealItem>
        <div className="border-y border-[#2a2f2c] py-10 px-6">
          <div className="max-w-[1120px] mx-auto flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-center">
            {[
              { value: "0", label: "Concorrentes no Brasil" },
              { value: "5%", label: "Empresas BR usam SaaS" },
              { value: "R$49", label: "vs. US$139 dos gringos" },
              { value: "14 dias", label: "Trial grátis" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="font-display text-3xl font-bold text-[#FAFBFA]">
                  {stat.value}
                </span>
                <span className="text-sm text-[#5a5f5c]">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </RevealItem>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-[1120px] mx-auto">
          <RevealItem className="text-center mb-16">
            <span className="text-sm text-[#5DCAA5] uppercase tracking-[0.1em] font-medium">
              Recursos
            </span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold text-[#FAFBFA] mt-3 leading-[1.15]">
              Tudo que seu negócio precisa
              <br />
              para aparecer onde importa
            </h2>
          </RevealItem>

          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <RevealItem key={f.title} delay={i * 100}>
                <div className="group relative flex flex-col h-full bg-[#1a1f1c] border border-[rgba(255,255,255,0.04)] rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(93,202,165,0.15)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
                  <div className="w-14 h-14 rounded-xl bg-[rgba(29,158,117,0.12)] flex items-center justify-center text-[#1D9E75] mb-5 transition-colors group-hover:bg-[rgba(29,158,117,0.18)]">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-[#FAFBFA] mb-3">
                    {f.title}
                  </h3>
                  <p className="text-[15px] text-[#9a9f9c] leading-relaxed flex-1">
                    {f.description}
                  </p>
                  <a
                    href={f.link}
                    className="inline-block mt-5 text-sm text-[#5DCAA5] hover:text-[#1D9E75] transition-colors"
                  >
                    {f.linkText}
                  </a>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      {/* ── GEO Section ───────────────────────────────────── */}
      <section id="geo" className="py-24 px-6 bg-[#0d1210]">
        <div className="max-w-[1120px] mx-auto grid md:grid-cols-2 gap-16 items-center">
          {/* Copy */}
          <RevealItem>
            <div>
              <span className="text-sm text-[#5DCAA5] uppercase tracking-[0.1em] font-medium">
                Monitor GEO
              </span>
              <h2 className="font-display text-[clamp(1.8rem,3.5vw,2.6rem)] font-bold text-[#FAFBFA] mt-3 mb-5 leading-[1.15]">
                As IAs estão indicando
                <br />
                seus concorrentes.
                <br />
                <span className="text-[#1D9E75]">E você?</span>
              </h2>
              <p className="text-[15px] text-[#9a9f9c] leading-relaxed mb-8">
                Quando alguém pergunta ao ChatGPT{" "}
                <em className="text-[#FAFBFA] not-italic">
                  &ldquo;melhor pizzaria em Moema&rdquo;
                </em>
                , qual negócio aparece? O Vitrine.ai monitora sua presença nas
                principais IAs generativas e dá recomendações para você ser
                citado.
              </p>
              <div className="flex flex-col gap-3.5">
                {[
                  "Monitoramento em ChatGPT, Gemini e Perplexity",
                  "Queries geradas automaticamente para sua categoria e cidade",
                  "Recomendações de conteúdo para melhorar citação nas IAs",
                  "Primeiro produto do Brasil com essa funcionalidade",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 text-[15px] text-[#9a9f9c]">
                    <svg
                      className="w-5 h-5 text-[#1D9E75] flex-shrink-0 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </RevealItem>

          {/* GEO Mockup */}
          <RevealItem delay={150}>
            <div className="bg-[#1a1f1c] border border-[rgba(93,202,165,0.1)] rounded-2xl p-6">
              <div className="text-xs text-[#5a5f5c] uppercase tracking-widest mb-4">
                Monitor GEO — Casa da Pizza
              </div>
              <div className="flex flex-col gap-3">
                {GEO_QUERIES.map((q) => (
                  <div
                    key={q.query + q.platform}
                    className={`rounded-xl p-4 border ${
                      q.found
                        ? "border-[rgba(29,158,117,0.2)] bg-[rgba(29,158,117,0.06)]"
                        : "border-[rgba(226,75,74,0.2)] bg-[rgba(226,75,74,0.04)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[13px] text-[#dadedd]">
                        &ldquo;{q.query}&rdquo;
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#5a5f5c]">
                          {q.platform}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                            q.found
                              ? "bg-[rgba(29,158,117,0.15)] text-[#5DCAA5]"
                              : "bg-[rgba(226,75,74,0.15)] text-[#F09595]"
                          }`}
                        >
                          {q.found ? "✓ Encontrado" : "✗ Ausente"}
                        </span>
                      </div>
                    </div>
                    {q.snippet && (
                      <p className="text-[12px] text-[#5a5f5c] leading-relaxed">
                        {q.snippet}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </RevealItem>
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────── */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-[1120px] mx-auto">
          <RevealItem className="text-center mb-16">
            <span className="text-sm text-[#5DCAA5] uppercase tracking-[0.1em] font-medium">
              Preços
            </span>
            <h2 className="font-display text-[clamp(2rem,4vw,3rem)] font-bold text-[#FAFBFA] mt-3">
              Simples. Sem surpresa.
            </h2>
            <p className="text-[#9a9f9c] mt-3 text-[15px]">
              14 dias grátis em qualquer plano. Cancele quando quiser.
            </p>
          </RevealItem>

          <div className="grid md:grid-cols-3 gap-5 items-start">
            {PLANS.map((plan, i) => (
              <RevealItem key={plan.name} delay={i * 100}>
                <div
                  className={`relative flex flex-col rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 ${
                    plan.popular
                      ? "border-[#1D9E75] bg-gradient-to-b from-[rgba(29,158,117,0.08)] to-[#1a1f1c] shadow-[0_0_60px_rgba(29,158,117,0.12)]"
                      : "border-[rgba(255,255,255,0.06)] bg-[#1a1f1c] hover:border-[rgba(93,202,165,0.15)]"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#1D9E75] text-[11px] font-semibold text-white uppercase tracking-wider">
                      Mais popular
                    </div>
                  )}

                  <div className="mb-6">
                    <div className="text-[15px] font-semibold text-[#FAFBFA] mb-1">
                      {plan.name}
                    </div>
                    <div className="text-[13px] text-[#5a5f5c] mb-4">
                      {plan.description}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px] text-[#5a5f5c]">R$</span>
                      <span className="font-display text-5xl font-bold text-[#FAFBFA]">
                        {plan.price}
                      </span>
                      <span className="text-[13px] text-[#5a5f5c]">/mês</span>
                    </div>
                  </div>

                  <a
                    href="#cta"
                    className={`block text-center py-3 rounded-[10px] text-[15px] font-medium mb-7 transition-all duration-200 ${
                      plan.popular
                        ? "bg-[#1D9E75] text-white hover:bg-[#3DB88E] hover:shadow-[0_8px_32px_rgba(29,158,117,0.3)]"
                        : "border border-[#3a3f3c] text-[#9a9f9c] hover:border-[#5a5f5c] hover:text-[#FAFBFA]"
                    }`}
                  >
                    {plan.cta}
                  </a>

                  <ul className="flex flex-col gap-3">
                    {plan.features.map((feat) => (
                      <li
                        key={feat}
                        className="flex items-center gap-2.5 text-[14px] text-[#9a9f9c]"
                      >
                        <svg
                          className="w-4 h-4 text-[#1D9E75] flex-shrink-0"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </RevealItem>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────── */}
      <section id="cta" className="py-24 px-6">
        <RevealItem>
          <div
            className="max-w-[640px] mx-auto text-center rounded-3xl p-12 border border-[rgba(93,202,165,0.1)]"
            style={{
              background:
                "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(29,158,117,0.12) 0%, transparent 70%), #1a1f1c",
            }}
          >
            <h2 className="font-display text-[clamp(1.8rem,4vw,2.8rem)] font-bold text-[#FAFBFA] leading-[1.15] mb-4">
              Descubra como seu negócio
              <br />
              aparece no Google e nas IAs
            </h2>
            <p className="text-[15px] text-[#9a9f9c] mb-8">
              Análise gratuita. Sem cartão de crédito. Resultado em 60 segundos.
            </p>
            <CtaInput />
            <p className="mt-4 text-[13px] text-[#5a5f5c]">
              Mais de 50 negócios analisados • Sem cadastro para ver o score
            </p>
          </div>
        </RevealItem>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-[#2a2f2c] py-10 px-6">
        <div className="max-w-[1120px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#5a5f5c]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#9a9f9c]">vitrine</span>
            <span className="text-[#1D9E75] font-semibold">.ai</span>
          </div>
          <div className="flex gap-6">
            <a href="/blog" className="hover:text-[#9a9f9c] transition-colors">Blog</a>
            <a href="/precos" className="hover:text-[#9a9f9c] transition-colors">Preços</a>
            <a href="/analisar" className="hover:text-[#9a9f9c] transition-colors">Analisar grátis</a>
          </div>
          <span>© 2026 Vitrine.ai · Feito no Brasil</span>
        </div>
      </footer>

      {/* ── Global keyframes ──────────────────────────────── */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
