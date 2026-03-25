/**
 * Rate limiting simples com Redis (Upstash)
 * Para evitar abuso de endpoints críticos (IA, checkout)
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Inicializar Redis (use variáveis de environment)
// UPSTASH_REDIS_REST_URL
// UPSTASH_REDIS_REST_TOKEN
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

/**
 * Rate limiter por user + endpoint
 * @param userId - ID do usuário autenticado
 * @param endpoint - Nome do endpoint (ex: "ai-review-response")
 * @param limit - Número de requisições permitidas
 * @param window - Window em segundos (padrão: 60s)
 */
export async function checkRateLimit(
  userId: string,
  endpoint: string,
  limit: number = 5,
  window: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  // Se Redis não está configurado, permitir (apenas em dev)
  if (!redis) {
    console.warn("[RateLimit] Redis não configurado, permitindo requisição");
    return { success: true, remaining: limit, reset: Date.now() + window * 1000 };
  }

  try {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${window}s`),
      analytics: true,
      prefix: `ratelimit:${endpoint}:${userId}`,
    });

    const { success, remaining, reset } = await ratelimit.limit(`${userId}`);

    return { success, remaining, reset };
  } catch (error) {
    console.error("[RateLimit] Erro ao verificar taxa:", error);
    // Em caso de erro, negar acesso (fail-secure)
    return { success: false, remaining: 0, reset: Date.now() + window * 1000 };
  }
}

/**
 * Rate limiting por IP (para endpoints públicos)
 */
export async function checkRateLimitByIP(
  ip: string,
  endpoint: string,
  limit: number = 10,
  window: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  if (!redis) {
    return { success: true, remaining: limit, reset: Date.now() + window * 1000 };
  }

  try {
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(limit, `${window}s`),
      analytics: true,
      prefix: `ratelimit:${endpoint}:ip`,
    });

    const { success, remaining, reset } = await ratelimit.limit(ip);

    return { success, remaining, reset };
  } catch (error) {
    console.error("[RateLimit] Erro ao verificar taxa por IP:", error);
    return { success: false, remaining: 0, reset: Date.now() + window * 1000 };
  }
}

/**
 * Configuração de rate limits por endpoint (CUSTOMIZE CONFORME NECESSÁRIO)
 */
export const RATE_LIMIT_CONFIG = {
  // IA APIs (custos variáveis)
  "ai.review-response": { limit: 5, window: 60 }, // 5 por minuto
  "ai.google-post": { limit: 3, window: 60 }, // 3 por minuto
  "ai.monitor-geo": { limit: 2, window: 3600 }, // 2 por hora

  // Pagamento (evitar fraude)
  "checkout.create": { limit: 10, window: 60 }, // 10 por minuto
  "webhook.mercadopago": { limit: 100, window: 60 }, // 100 por minuto (webhooks legítimos são rápidos)

  // Google APIs (integração)
  "google.locations": { limit: 20, window: 3600 }, // 20 por hora
  "google.reviews": { limit: 10, window: 3600 }, // 10 por hora
  "google.insights": { limit: 5, window: 3600 }, // 5 por hora

  // Público (lead magnet)
  "public.analyzer": { limit: 3, window: 3600 }, // 3 por hora
};

/**
 * Extrair IP real do cliente (considera proxies)
 */
export function getClientIP(request: Request): string {
  const headersList = new Headers(request.headers);
  return (
    headersList.get("x-forwarded-for")?.split(",")[0].trim() ||
    headersList.get("x-real-ip") ||
    headersList.get("cf-connecting-ip") ||
    "unknown"
  );
}
