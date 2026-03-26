import dynamic from "next/dynamic";
import { Navbar } from "@/components/marketing/Navbar";
import { ScoreCardMockup } from "@/components/marketing/ScoreCardMockup";
import { RevealItem } from "@/components/marketing/RevealItem";

// ─── Dynamic Sections ────────────────────────────────────────────────────────

const FeaturesSection = dynamic(() => import("@/components/marketing/FeaturesSection").then(mod => mod.FeaturesSection), {
  ssr: true,
  loading: () => <div className="py-24 text-center opacity-50">Carregando recursos...</div>
});

const GeoSection = dynamic(() => import("@/components/marketing/GeoSection").then(mod => mod.GeoSection), {
  ssr: true,
  loading: () => <div className="py-24 text-center opacity-50">Carregando monitor GEO...</div>
});

const PricingSection = dynamic(() => import("@/components/marketing/PricingSection").then(mod => mod.PricingSection), {
  ssr: true,
  loading: () => <div className="py-24 text-center opacity-50">Carregando planos...</div>
});

const CtaFinalSection = dynamic(() => import("@/components/marketing/CtaFinalSection").then(mod => mod.CtaFinalSection), {
  ssr: true,
  loading: () => <div className="py-24 text-center opacity-50">...</div>
});

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

      <FeaturesSection />

      <GeoSection />

      <PricingSection />

      <CtaFinalSection />

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-[#2a2f2c] py-10 px-6">
        <div className="max-w-[1120px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-[13px] text-[#5a5f5c]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#9a9f9c]">vitrine</span>
            <span className="text-[#1D9E75] font-semibold">.ai</span>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="/blog" className="hover:text-[#9a9f9c] transition-colors">Blog</a>
            <a href="/precos" className="hover:text-[#9a9f9c] transition-colors">Preços</a>
            <a href="/termos" className="hover:text-[#9a9f9c] transition-colors">Termos</a>
            <a href="/privacidade" className="hover:text-[#9a9f9c] transition-colors">Privacidade</a>
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
