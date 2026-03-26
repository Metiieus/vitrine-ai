import { Navbar } from "@/components/marketing/Navbar";

export default function TermosPage() {
    return (
        <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] font-sans">
            <Navbar />

            <main className="max-w-4xl mx-auto pt-44 pb-28 px-6">
                <h1 className="text-4xl font-bold text-[#FAFBFA] mb-8">Termos de Uso</h1>

                <div className="prose prose-invert max-w-none space-y-6 text-[#9a9f9c]">
                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">1. Aceitação dos Termos</h2>
                        <p>
                            Ao acessar e utilizar o Vitrine.ai, você concorda em cumprir e estar vinculado a estes Termos de Uso.
                            Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">2. Descrição do Serviço</h2>
                        <p>
                            O Vitrine.ai é uma plataforma SaaS que oferece auditoria de presença digital, automação de respostas a reviews
                            com IA e monitoramento de visibilidade em motores de busca generativos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">3. Assinaturas e Pagamentos</h2>
                        <p>
                            Oferecemos planos de assinatura mensal e anual. Os pagamentos são processados via Mercado Pago.
                            Ao assinar um plano, você autoriza a cobrança recorrente no método de pagamento escolhido.
                            O cancelamento pode ser feito a qualquer momento pelo painel do usuário, interrompendo a renovação para o próximo ciclo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">4. Responsabilidades do Usuário</h2>
                        <p>
                            Você é responsável por manter a segurança de sua conta e por todas as atividades que ocorrem nela.
                            O uso da IA para gerar respostas deve seguir as diretrizes éticas e legais, sendo o usuário o responsável final
                            pelo conteúdo publicado em seu nome.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">5. Limitação de Responsabilidade</h2>
                        <p>
                            O Vitrine.ai busca fornecer dados precisos, mas não garante resultados específicos em rankings de busca ou
                            aumento de vendas, pois estes dependem de fatores externos às ferramentas da plataforma.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">6. Jurisdição</h2>
                        <p>
                            Estes termos são regidos pelas leis da República Federativa do Brasil. Qualquer litígio será resolvido
                            no foro da comarca de domicílio da empresa detentora do Vitrine.ai.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-[#2a2f2c] py-10 px-6">
                <div className="max-w-[1120px] mx-auto text-center text-[13px] text-[#5a5f5c]">
                    <span>© 2026 Vitrine.ai · Todos os direitos reservados.</span>
                </div>
            </footer>
        </div>
    );
}
