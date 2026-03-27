'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckoutButton } from '@/components/dashboard/CheckoutButton';
import { Card } from '@/components/ui/card';

const plans = [
  {
    id: 'essential',
    name: 'Essencial',
    price: '49',
    description: 'Perfeito para começar',
    features: [
      '✓ 1 negócio',
      '✓ Auditoria completa (score 0-100)',
      '✓ Checklist de tarefas prioritárias',
      '✓ 5 respostas IA para reviews/mês',
      '✓ 2 Google Posts com IA/mês',
      '✓ Monitor GEO em 1 IA (Gemini)',
      '✓ Relatório PDF básico',
      '✓ Dashboard completo',
      '✗ Sem API',
      '✗ Sem white-label',
    ],
    cta: 'Começar agora',
    highlighted: false,
  },
  {
    id: 'pro',
    name: 'Profissional',
    price: '99',
    description: 'Mais respostas + análise GEO avançada',
    features: [
      '✓ 1 negócio',
      '✓ Auditoria completa (score 0-100)',
      '✓ Checklist com recomendações',
      '✓ Respostas IA ilimitadas para reviews',
      '✓ 8 Google Posts com IA/mês',
      '✓ Monitor GEO em 3 IAs (Gemini, ChatGPT, Perplexity)',
      '✓ Heat map de posição no Maps',
      '✓ Relatório PDF completo + gráficos',
      '✓ Alertas de novas reviews em tempo real',
      '✓ Suporte por email + chat',
    ],
    cta: 'Assinar Profissional',
    highlighted: true,
  },
  {
    id: 'agency',
    name: 'Agência',
    price: '299',
    description: 'Para gerenciar vários clientes',
    features: [
      '✓ Até 5 negócios',
      '✓ Auditoria completa (score 0-100)',
      '✓ Checklist com recomendações',
      '✓ Respostas IA ilimitadas para reviews',
      '✓ 16 Google Posts com IA/mês',
      '✓ Monitor GEO em 5 IAs (Gemini, ChatGPT, Perplexity + 2)',
      '✓ Heat map de posição no Maps',
      '✓ Relatório PDF automático semanalmente',
      '✓ API para integrações customizadas',
      '✓ White-label (remover marca Vitrine.ai)',
      '✓ Dashboard customizável',
      '✓ Suporte prioritário 24/7',
    ],
    cta: 'Assinar Agência',
    highlighted: false,
  },
];

const faqs = [
  {
    q: 'Posso cancelar a qualquer momento?',
    a: 'Sim, sem compromisso. Cancel sua assinatura quando quiser direto no dashboard.',
  },
  {
    q: 'Qual a diferença entre os planos?',
    a: 'O Essencial é perfeito para começar, o Profissional tem mais respostas IA e monitor GEO expandido, e o Agência permite gerenciar múltiplos clientes.',
  },
  {
    q: 'Vocês oferecem período de teste?',
    a: 'Oferecemos 14 dias de teste grátis do plano Free automaticamente ao criar uma conta. Sem cartão de crédito necessário.',
  },
  {
    q: 'Qual método de pagamento vocês aceitam?',
    a: 'Aceitamos todos os métodos pelo Mercado Pago: cartão de crédito, débito, Pix, boleto e saldo da conta.',
  },
  {
    q: 'Há descontos para pagamento anual?',
    a: 'Sim! Pague 12 meses e ganhe 2 meses grátis (apenas para clientes do plano Profissional ou Agência).',
  },
];

function PricingAlerts() {
  const searchParams = useSearchParams();
  const trialExpired = searchParams.get('trial_expired');

  if (!trialExpired) return null;

  return (
    <div className="bg-red-500 text-white text-center py-3 font-semibold px-4 shadow-md">
      ⚠️ Seu período de teste de 14 dias expirou. Faça o upgrade e retome o acesso a todos os recursos imediatamente!
    </div>
  );
}

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#E1F5EE] to-[#9FE1CB]">
      <Suspense fallback={null}>
        <PricingAlerts />
      </Suspense>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-[#04342C] mb-4">
          Preços simples. Sem surpresas.
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Escolha o plano que melhor se encaixa no seu negócio. Todas as funcionalidades principais estão em todos os planos.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative p-8 flex flex-col transition-all ${plan.highlighted
                ? 'ring-2 ring-[#1D9E75] shadow-2xl transform scale-105'
                : 'border'
                }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#1D9E75] text-white px-4 py-1 rounded-full text-sm font-bold">
                  POPULAR
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-bold text-[#04342C] mb-2">
                  {plan.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                <div className="flex items-baseline">
                  <span className="text-5xl font-bold text-[#1D9E75]">
                    R${plan.price}
                  </span>
                  <span className="text-gray-600 ml-2">/mês</span>
                </div>
              </div>

              <div className="flex-1 mb-8">
                <div className="space-y-3">
                  {plan.features.map((feature: string) => {
                    const isIncluded = feature.startsWith('✓');
                    return (
                      <div
                        key={feature}
                        className={`flex items-start gap-3 text-sm ${isIncluded ? 'text-gray-700' : 'text-gray-400'
                          }`}
                      >
                        <span
                          className={`flex-shrink-0 font-bold ${isIncluded ? 'text-[#1D9E75]' : 'text-gray-300'
                            }`}
                        >
                          {isIncluded ? '✓' : '✗'}
                        </span>
                        <span>{feature.substring(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <CheckoutButton
                plan={plan.id as any}
                planName={plan.name}
                price={plan.price}
                className="w-full"
                variant={plan.highlighted ? 'default' : 'outline'}
              />
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-[#04342C] text-center mb-12">
          Perguntas Frequentes
        </h2>

        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-[#04342C] mb-2">{faq.q}</h3>
              <p className="text-gray-600">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Final */}
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="bg-[#0F6E56] text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-4">Pronto para começar?</h2>
          <p className="text-lg mb-6 opacity-90">
            Não é necessário cartão de crédito inicial. Você começou automaticamente com seu Plano Free de 14 dias.
          </p>
          <CheckoutButton
            plan="pro"
            planName="Profissional"
            price="99"
            variant="default"
            className="bg-white text-[#0F6E56] hover:bg-gray-50 text-base"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p className="mb-2">
            Vitrine.ai © 2026. Feito com ❤️ para pequenos negócios. Seguro, rápido e confiável.
          </p>
          <div className="flex justify-center gap-4 text-xs font-medium">
            <a href="/termos" className="hover:text-[#1D9E75] transition-colors">Termos de Uso</a>
            <span className="text-gray-300">|</span>
            <a href="/privacidade" className="hover:text-[#1D9E75] transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </div>
  );
}
