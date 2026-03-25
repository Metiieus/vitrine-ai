// Wrapper simplificado para Mercado Pago API
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const apiUrl = "https://api.mercadopago.com/checkout/preferences";

// Dados dos planos
export const PLANES = {
  essential: {
    name: "Essencial",
    price: 4900, // R$49.00 em centavos
    currency: "BRL",
    description: "Auditoria, score, checklist, 5 respostas IA/mês, 2 posts/mês",
  },
  pro: {
    name: "Profissional",
    price: 9900, // R$99.00
    currency: "BRL",
    description:
      "Tudo do Essencial + respostas ilimitadas, 4 posts/mês, monitor GEO (3 IAs), ranking Maps, relatório PDF",
  },
  agency: {
    name: "Agência",
    price: 29900, // R$299.00
    currency: "BRL",
    description:
      "Tudo do Pro + até 5 perfis, white-label, monitor GEO (5 IAs), API, suporte prioritário",
  },
};

/**
 * Criar preferência de pagamento (checkout link)
 */
export async function createPaymentPreference(params: {
  userId: string;
  plan: "essential" | "pro" | "agency";
  email: string;
  fullName?: string;
}) {
  const planData = PLANES[params.plan];

  const preference = {
    items: [
      {
        id: params.plan,
        title: `Vitrine.ai - Plano ${planData.name}`,
        description: planData.description,
        unit_price: planData.price / 100, // Converter de centavos para reais
        quantity: 1,
        currency_id: planData.currency,
      },
    ],
    payer: {
      email: params.email,
      name: params.fullName || params.email,
    },
    back_urls: {
      success: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/success?user_id=${params.userId}&plan=${params.plan}`,
      failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?error=payment_failed`,
      pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?status=pending`,
    },
    notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mercadopago/webhook`,
    auto_return: "approved",
    binary_mode: true,
    expires: true,
    expiration_date_from: new Date().toISOString(),
    expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    metadata: {
      user_id: params.userId,
      plan: params.plan,
    },
  };

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(preference),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(
      `Mercado Pago API Error: ${error.message || "Unknown error"}`
    );
  }

  const result = await response.json();
  return result;
}

/**
 * Obter informações de um pagamento
 */
export async function getPaymentInfo(paymentId: string) {
  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch payment info");
  }

  const result = await response.json();
  return result;
}

/**
 * Validar assinatura do webhook
 */
export function validateWebhookSignature(
  body: string,
  signature: string | string[] | undefined,
  token: string
): boolean {
  if (!signature) return false;

  // Mercado Pago usa HMAC-SHA256
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', token)
    .update(body)
    .digest('hex');

  const signatureStr = Array.isArray(signature) ? signature[0] : signature;
  return signatureStr === expected;
}

export type PaymentStatus = "approved" | "pending" | "rejected" | "cancelled";

export interface WebhookPayload {
  id: string;
  action: string; // "payment.created", "payment.updated"
  api_version: string;
  data: {
    id: string;
  };
  type: string;
}
