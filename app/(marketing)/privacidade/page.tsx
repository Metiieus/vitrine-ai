import { Navbar } from "@/components/marketing/Navbar";

export default function PrivacidadePage() {
    return (
        <div className="min-h-screen bg-[#0A0F0D] text-[#dadedd] font-sans">
            <Navbar />

            <main className="max-w-4xl mx-auto pt-44 pb-28 px-6">
                <h1 className="text-4xl font-bold text-[#FAFBFA] mb-8">Política de Privacidade</h1>

                <div className="prose prose-invert max-w-none space-y-6 text-[#9a9f9c]">
                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">1. Compromisso com a Privacidade</h2>
                        <p>
                            O Vitrine.ai respeita sua privacidade e está comprometido em proteger seus dados pessoais.
                            Esta política descreve como tratamos as informações coletadas através de nossa plataforma, em conformidade com a LGPD.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">2. Coleta de Dados</h2>
                        <p>
                            Coletamos informações necessárias para a prestação do serviço:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Dados cadastrais (Nome, E-mail, Documento).</li>
                            <li>Informações do negócio (Nome da empresa, dados do Google Meu Negócio).</li>
                            <li>Dados de pagamento (Processados de forma criptografada pelo Mercado Pago).</li>
                            <li>Logs de acesso e auditoria para garantir a segurança da plataforma.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">3. Uso das Informações</h2>
                        <p>
                            Seus dados são utilizados exclusivamente para:
                        </p>
                        <ul className="list-disc pl-6 space-y-2">
                            <li>Gerenciar sua conta e assinaturas.</li>
                            <li>Operar as funcionalidades de IA solicitadas.</li>
                            <li>Melhorar nossa tecnologia e suporte ao cliente.</li>
                            <li>Cumprir obrigações legais e regulatórias.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">4. Segurança dos Dados</h2>
                        <p>
                            Implementamos medidas técnicas e organizacionais avançadas para proteger seus dados contra acessos
                            não autorizados, perda ou destruição. Todas as comunicações sensíveis são criptografadas via SSL (HTTPS).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">5. Seus Direitos</h2>
                        <p>
                            De acordo com a LGPD, você tem o direito de acessar, corrigir, anonimizar ou solicitar a exclusão de seus
                            dados pessoais a qualquer momento através do nosso contato de suporte.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-semibold text-[#FAFBFA]">6. Cookies</h2>
                        <p>
                            Utilizamos cookies estritamente necessários para manter sua sessão ativa e autenticada. Cookies de terceiros
                            podem ser utilizados para análise de desempenho do site.
                        </p>
                    </section>
                </div>
            </main>

            <footer className="border-t border-[#2a2f2c] py-10 px-6">
                <div className="max-w-[1120px] mx-auto text-center text-[13px] text-[#5a5f5c]">
                    <span>© 2026 Vitrine.ai · Protegido pela LGPD.</span>
                </div>
            </footer>
        </div>
    );
}
