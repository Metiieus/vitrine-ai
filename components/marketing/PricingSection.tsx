import { RevealItem } from "./RevealItem";

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

export function PricingSection() {
    return (
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
                                className={`relative flex flex-col rounded-2xl p-7 border transition-all duration-300 hover:-translate-y-1 ${plan.popular
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
                                    className={`block text-center py-3 rounded-[10px] text-[15px] font-medium mb-7 transition-all duration-200 ${plan.popular
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
    );
}
