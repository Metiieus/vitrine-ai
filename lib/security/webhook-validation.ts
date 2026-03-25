/**
 * Validação de webhooks com HMAC-SHA256
 * Protege contra falsificação de webhooks
 */

import crypto from "crypto";

/**
 * Validar assinatura HMAC do Mercado Pago
 * 
 * @param requestBody - Body raw do webhook (como string)
 * @param signature - Assinatura do header X-Signature ou Authorization
 * @param secret - Seu webhook token do Mercado Pago
 * @returns boolean — true se válido, false se inválido
 */
export function validateMercadoPagoSignature(
  requestBody: string,
  signature: string | undefined,
  secret: string
): boolean {
  if (!signature) {
    console.warn("[Security] Mercado Pago webhook sem assinatura");
    return false;
  }

  try {
    // Mercado Pago usa formato: "ts=1234567890,v1=assinatura_hex"
    const parts = signature.split(",");
    const versionPart = parts.find((p) => p.startsWith("v1="));
    const timestampPart = parts.find((p) => p.startsWith("ts="));

    if (!versionPart || !timestampPart) {
      console.warn("[Security] Formato de assinatura inválido");
      return false;
    }

    const providedSignature = versionPart.substring(3); // remove "v1="
    const timestamp = timestampPart.substring(3); // remove "ts="

    // Recriar a assinatura esperada
    const data = `${timestamp}.${requestBody}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    // Comparar com timing-safe (evitar timing attacks)
    const isValid = crypto.timingSafeEqual(
      Buffer.from(providedSignature),
      Buffer.from(expectedSignature)
    );

    if (!isValid) {
      console.warn("[Security] Assinatura Mercado Pago inválida");
    }

    return isValid;
  } catch (error) {
    console.error("[Security] Erro ao validar webhook:", error);
    return false;
  }
}

/**
 * HMAC genérico para outros webhooks
 */
export function validateHmacSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  try {
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch (error) {
    console.error("[Security] Erro ao validar HMAC:", error);
    return false;
  }
}

/**
 * Validar replay attack (timestamp recente)
 * Útil para webhooks com timestamp
 */
export function isTimestampRecent(
  timestampMs: number,
  maxAgeMs: number = 5 * 60 * 1000 // 5 minutos padrão
): boolean {
  const now = Date.now();
  const age = now - timestampMs;
  return age >= 0 && age <= maxAgeMs;
}
