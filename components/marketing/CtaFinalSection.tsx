import { RevealItem } from "./RevealItem";
import { CtaInput } from "./CtaInput";

export function CtaFinalSection() {
    return (
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
    );
}
