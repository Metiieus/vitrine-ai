import { RevealItem } from "./RevealItem";

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

export function FeaturesSection() {
    return (
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
    );
}
