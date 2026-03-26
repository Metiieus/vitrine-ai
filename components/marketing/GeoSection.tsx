import { RevealItem } from "./RevealItem";

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

export function GeoSection() {
    return (
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
                                    className={`rounded-xl p-4 border ${q.found
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
                                                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${q.found
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
    );
}
